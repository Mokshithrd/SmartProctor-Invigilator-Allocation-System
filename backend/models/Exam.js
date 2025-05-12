const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
    semester: { type: Number, required: true }, // 1, 2, 3, 4...
    totalStudents: { type: Number, required: true }
});

const examSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Example: CIE1, CIE2
        year: { type: String, required: true }, // 2025, 2026-...
        semesters: [semesterSchema], // Array of semesters included in this exam
        rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }], // Selected rooms
        faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // Selected faculty
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true }], // Subjects in the exam
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);