const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const { auth, isAdmin } = require("../middleware/authMiddleware");

// Create a new exam (Admin only)
router.post("/create", auth, isAdmin, examController.createExam);

// Get all exams (Admin only)
router.get("/", auth, examController.getAllExams);

// Get one exam by ID (Admin only)
router.get("/:id", auth, examController.getExamById);

// Delete an exam and all related data (Admin only)
router.delete("/delete/:examId", auth, isAdmin, examController.deleteExam);

module.exports = router;
