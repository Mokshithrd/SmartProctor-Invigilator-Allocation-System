const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    building: { type: String, required: true },
    floor: { type: String, required: true },
    roomNumber: { type: String, required: true },
    totalBenches: { type: Number, required: true },
    studentsPerBench: { type: Number, required: true },
    capacity: { type: Number, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
