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
            })
        }

        let user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email is not registered",
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            role: user.role
        };

        if (await bcrypt.compare(password, user.password)) {
            let token = jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "3h"
                }
            );
            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                maxAge: 3 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Secure only in production
                sameSite: "Strict", // Prevent CSRF attacks
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User logged in successfully",
            });
        } else {
            return res.status(403).json({
                success: false,
                message: "Password Incorrect",
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login failure",
        });
    }
}