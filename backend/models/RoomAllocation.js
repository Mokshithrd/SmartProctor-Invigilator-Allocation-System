const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomNumber: { type: String, required: true },
    students: { type: [String], required: true },
    date: { type: Date, required: true }, // Ensure we store the date
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

module.exports = mongoose.model("RoomAllocation", roomAllocationSchema);
