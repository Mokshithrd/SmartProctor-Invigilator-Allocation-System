const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { auth, isAdmin } = require("../middleware/authMiddleware");

// Create a new exam (Admin only)
router.post("/create", auth, isAdmin, examController.createExam);

module.exports = router;
