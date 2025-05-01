const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const { exportStudentAllotmentPDF, exportFacultyAllotmentPDF } = require("../controllers/pdfController");

router.get("/student-room-pdf/:examId",exportStudentAllotmentPDF);
router.get("/faculty-room-pdf/:examId",exportFacultyAllotmentPDF);

module.exports = router;
