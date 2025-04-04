const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const {
    addRoom,
    getAllRooms,
    updateRoom,
    deleteRoom
} = require("../controllers/roomController");

// Add Room - Admin only
router.post("/add", auth, isAdmin, addRoom);

// Get All Rooms - Admin only
router.get("/all", auth, isAdmin, getAllRooms);

// Update Room by ID - Admin only
router.put("/update/:id", auth, isAdmin, updateRoom);

// Delete Room by ID - Admin only
router.delete("/delete/:id", auth, isAdmin, deleteRoom);

module.exports = router;
