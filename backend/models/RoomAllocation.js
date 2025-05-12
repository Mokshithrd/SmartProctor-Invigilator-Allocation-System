const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomNumber: { type: String, required: true },
    // Support multiple subjects when exams from different semesters share a room
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    students: { type: [String], required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
});

// Validate that either subjectId or subjectIds is provided
roomAllocationSchema.pre('validate', function(next) {
    if ((!this.subjectId && (!this.subjectIds || this.subjectIds.length === 0)) || 
        (this.subjectId && this.subjectIds && this.subjectIds.length > 0)) {
        this.invalidate('subjectId', 'Either subjectId or subjectIds must be provided, but not both');
    }
    next();
});

module.exports = mongoose.model("RoomAllocation", roomAllocationSchema);