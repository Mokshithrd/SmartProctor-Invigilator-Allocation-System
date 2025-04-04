const Room = require("../models/Room");

// Add Room
exports.addRoom = async (req, res) => {
    try {
        const { building, floor, roomNumber, totalBenches, studentsPerBench } = req.body;

        if (!building || !floor || !roomNumber || !totalBenches || !studentsPerBench) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if room already exists
        const existingRoom = await Room.findOne({ building, roomNumber });
        if (existingRoom) {
            return res.status(400).json({ success: false, message: "Room already exists in this building" });
        }

        const capacity = totalBenches * studentsPerBench;

        const newRoom = await Room.create({
            building,
            floor,
            roomNumber,
            totalBenches,
            studentsPerBench,
            capacity // Store calculated capacity
        });

        res.status(201).json({ success: true, message: "Room added successfully", data: newRoom });

    } catch (err) {
        console.error("Error adding room:", err);
        res.status(500).json({ success: false, message: "Error adding room" });
    }
};

// Get All Rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({ success: true, data: rooms });
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ success: false, message: "Error fetching rooms" });
    }
};

// Update Room
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { building, floor, roomNumber, totalBenches, studentsPerBench } = req.body;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Update only the provided fields
        if (building) room.building = building;
        if (floor) room.floor = floor;
        if (roomNumber) room.roomNumber = roomNumber;
        if (totalBenches) room.totalBenches = totalBenches;
        if (studentsPerBench) room.studentsPerBench = studentsPerBench;

        // Recalculate capacity if benches or studentsPerBench changed
        if (totalBenches || studentsPerBench) {
            room.capacity = room.totalBenches * room.studentsPerBench;
        }

        await room.save();

        res.status(200).json({ success: true, message: "Room updated successfully", data: room });
    } catch (err) {
        console.error("Error updating room:", err);
        res.status(500).json({ success: false, message: "Error updating room" });
    }
};


// Delete Room
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRoom = await Room.findByIdAndDelete(id);
        if (!deletedRoom) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        res.status(200).json({ success: true, message: "Room deleted successfully" });
    } catch (err) {
        console.error("Error deleting room:", err);
        res.status(500).json({ success: false, message: "Error deleting room" });
    }
};
