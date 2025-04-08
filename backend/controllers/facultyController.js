const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Allocation = require("../models/Allocation");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Room = require("../models/Room");

const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

// Add Faculty - Admin only
exports.addFaculty = async (req, res) => {
    try {
        const { name, email, designation } = req.body;

        if (!name || !email || !designation) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if faculty already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Faculty already exists" });
        }

        // Generate random password
        const plainPassword = crypto.randomBytes(6).toString("hex"); // 12-char password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newFaculty = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "Faculty",
            designation
        });

        // Send password via email
        const message = `
            Hello ${name},\n\nYou have been added as Faculty.\nYour login credentials:\nEmail: ${email}\nPassword: ${plainPassword}\n\nPlease login and change your password if you wish.
        `;
        await sendEmail(email, "Faculty Account Created", message);

        res.status(201).json({ success: true, message: "Faculty added and password sent via email" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error adding faculty" });
    }
};

// Get All Faculties - Admin only
exports.getAllFaculties = async (req, res) => {
    try {
        const faculties = await User.find({ role: "Faculty" }).select("-password");
        res.status(200).json({ success: true, data: faculties });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch faculties" });
    }
};

// Get single faculty details
exports.getFacultyById = async (req, res) => {
    try {
        const facultyId = req.params.id;
        const faculty = await User.findById(facultyId).select("-password"); // Exclude password

        if (!faculty || faculty.role !== "Faculty") {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }

        res.status(200).json({ success: true, data: faculty });
    } catch (err) {
        console.error("Error fetching faculty:", err);
        res.status(500).json({ success: false, message: "Error fetching faculty details" });
    }
};



// Delete Faculty - Admin only
exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Faculty deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error deleting faculty" });
    }
};

// Faculty updates their own profile
exports.updateOwnProfile = async (req, res) => {
    try {
        const { name, email, password, designation } = req.body;
        const facultyId = req.user.id;

        let faculty = await User.findById(facultyId);
        if (!faculty || faculty.role !== "Faculty") {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }

        // Check for duplicate email if email is being updated
        if (email && email !== faculty.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "Email already in use by another user" });
            }
            faculty.email = email;
        }

        if (name) faculty.name = name;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            faculty.password = hashedPassword;
        }
        if (designation) faculty.designation = designation;

        await faculty.save();
        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating faculty profile:", err);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

exports.getFacultyDashboardData = async (req, res) => {
    const facultyId = req.user.id;

    try {
        const now = new Date();
        const todayDateString = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

        const allocations = await Allocation.find({ facultyId })
            .populate("examId", "name")
            .populate("roomId", "roomNumber building floor");

        const upcoming = [];
        const present = [];
        const completed = [];

        allocations.forEach(allocation => {
            const allocationDate = new Date(allocation.date);
            const allocationDateString = allocationDate.toISOString().split("T")[0];

            const startTimeFormatted = formatTime12Hour(allocation.startTime);
            const endTimeFormatted = formatTime12Hour(allocation.endTime);

            const data = {
                examName: allocation.examId.name,
                date: allocationDateString,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                room: {
                    number: allocation.roomId.roomNumber,
                    building: allocation.roomId.building,
                    floor: allocation.roomId.floor,
                }
            };

            if (allocationDateString === todayDateString) {
                present.push(data);
            } else if (allocationDate > now) {
                upcoming.push(data);
            } else {
                completed.push(data);
            }
        });

        res.status(200).json({
            success: true,
            upcoming,
            present,
            completed,
        });
    } catch (error) {
        console.error("Error fetching faculty dashboard:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all previous allocation of a faculty
exports.getFacultyAllocations = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await User.findById(id);
        if (!faculty) {
            return res.status(404).json({ success: false, message: "Faculty not found" });
        }

        const allocations = await Allocation.find({ facultyId: id })
            .populate("examId", "name")
            .populate("subjectId", "name")
            .populate("roomId", "roomNumber")
            .sort({ date: -1 }); // optional: latest first

        const response = {
            facultyName: faculty.name,
            designation: faculty.designation,
            allocations: allocations.map(alloc => ({
                examName: alloc.examId?.name,
                subjectName: alloc.subjectId?.name,
                roomNumber: alloc.roomId?.roomNumber,
                date: alloc.date,
                startTime: alloc.startTime,
                endTime: alloc.endTime
            }))
        };

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("Error fetching faculty allocations:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};