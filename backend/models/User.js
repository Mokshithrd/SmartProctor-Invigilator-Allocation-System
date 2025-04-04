const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["Admin", "Faculty"],
        default: "Faculty"
    },
    designation: {
        type: String,
        enum: ["Assistant Professor", "Associate Professor", "Professor"]
    },
    previousAllocations: {
        type: Number,
        default: 0
    },
    available: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);