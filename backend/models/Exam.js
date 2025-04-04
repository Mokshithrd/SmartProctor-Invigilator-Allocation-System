const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Example: CIE1, CIE2
        semester: { type: Number, required: true }, // 1, 2, 3, 4...
        year: { type: String, required: true }, // "1st Year", "2nd Year"
        totalStudents: { type: Number, required: true }, // Total number of students in the exam
        rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }], // Selected rooms
        faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // Selected faculty
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true }], // Subjects in the exam
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
