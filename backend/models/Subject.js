const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true }, // Link to exam
    name: { type: String, required: true }, // Subject Name
    subjectCode: { type: String, required: true }, // Subject Code
    date: { type: Date, required: true }, // Exam Date
    startTime: { type: String, required: true }, // Exam Start Time (e.g., "10:00 AM")
    endTime: { type: String, required: true } // Exam End Time (e.g., "12:00 PM")
});

module.exports = mongoose.model("Subject", subjectSchema);
