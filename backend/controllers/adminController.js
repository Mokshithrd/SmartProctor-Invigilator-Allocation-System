const bcrypt = require("bcrypt");
const User = require("../models/User");
const Room = require("../models/Room");
const Exam = require("../models/Exam");

exports.updateAdminProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const adminId = req.user.id;

        let admin = await User.findById(adminId);
        if (!admin || admin.role !== "Admin") {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // Check for duplicate email if updating
        if (email && email !== admin.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }
            admin.email = email;
        }

        if (name) admin.name = name;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            admin.password = hashedPassword;
        }

        await admin.save();
        res.status(200).json({ success: true, message: "Admin profile updated successfully" });
    } catch (err) {
        console.error("Error updating admin profile:", err);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};


exports.getAdminDashboardData = async (req, res) => {
    try {
        const [totalFaculty, totalRooms, totalExams, studentAgg] = await Promise.all([
            User.countDocuments({ role: "Faculty" }),
            Room.countDocuments(),
            Exam.countDocuments(),
            Exam.aggregate([
                { $group: { _id: null, totalStudents: { $sum: "$totalStudents" } } }
            ])
        ]);

        const totalStudents = studentAgg[0]?.totalStudents || 0;

        res.status(200).json({
            success: true,
            data: {
                totalFaculty,
                totalRooms,
                totalExams,
                totalStudents
            }
        });
    } catch (err) {
        console.error("Admin Dashboard Error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};