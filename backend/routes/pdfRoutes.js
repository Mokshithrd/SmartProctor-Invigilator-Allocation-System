const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const { exportStudentAllotmentPDF, exportFacultyAllotmentPDF } = require("../controllers/pdfController");

router.get("/student-room-pdf/:examId", auth, isAdmin, exportStudentAllotmentPDF);
router.get("/faculty-room-pdf/:examId", auth, isAdmin, exportFacultyAllotmentPDF);

module.exports = router;
