const bcrypt = require('bcrypt');
const User = require("../models/User");
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter all fields"
            });
        }

        let user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email is not registered",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({
                success: false,
                message: "Password Incorrect",
            });
        }

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "3h",
        });

        user = user.toObject();
        user.token = token;
        user.password = undefined;

        // ⚠️ Important: set cookie with correct config
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // set to true in production
            sameSite: "None", // "Strict" or "Lax"
            maxAge: 3 * 60 * 60 * 1000, // 3 hours
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user,
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({
            success: false,
            message: "Login failure",
        });
    }
};
