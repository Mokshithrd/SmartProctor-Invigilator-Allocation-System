const express = require('express');
const router = express.Router();
const { auth, isAdmin, isFaculty } = require("../middleware/authMiddleware");
const {addFaculty, getAllFaculties, deleteFaculty,updateOwnProfile, getFacultyById, getFacultyAllocations} = require("../controllers/facultyController");
// const { getFacultyDashboardData } = require("../controllers/facultyController");
const {getFacultyDashboardData} = require("../controllers/facultyController")


// Admin routes
router.post("/add", auth, isAdmin, addFaculty);
router.get("/all", auth, isAdmin, getAllFaculties);
router.delete("/:id", auth, isAdmin, deleteFaculty);

// Faculty route - update own profile
router.put("/update", auth, isFaculty, updateOwnProfile);

// Faculty dashboard
router.get("/dashboard", auth, isFaculty, getFacultyDashboardData);

// Admin routes
router.get("/:id", auth, isAdmin, getFacultyById);

router.get("/allocations/:id", auth, isAdmin, getFacultyAllocations);


module.exports = router;
