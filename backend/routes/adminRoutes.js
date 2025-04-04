const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const { updateAdminProfile,getAdminDashboardData } = require("../controllers/adminController");
// const { getAdminDashboardData, updateAdminProfile } = require("../controllers/adminController");



// Update own profile (Admin)
router.put("/update", auth, isAdmin, updateAdminProfile);

// Admin dashboard
router.get("/dashboard", auth, isAdmin, getAdminDashboardData);


module.exports = router;