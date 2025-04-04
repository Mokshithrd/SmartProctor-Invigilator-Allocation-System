const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Allocation = require("../models/Allocation");

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
    try {
        const facultyId = req.user.id;
        const upcomingAllocations = await Allocation.find({
            faculty: facultyId,
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        res.status(200).json({
            success: true,
            data: upcomingAllocations
        });
    } catch (err) {
        console.error("Faculty Dashboard Error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};