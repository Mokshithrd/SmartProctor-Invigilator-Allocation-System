const express = require('express');
const router = express.Router();

const {login} = require("../controllers/loginController");
const {logout} = require("../controllers/logoutController");
const {auth} = require("../middleware/authMiddleware");

router.post("/login",login);
router.post("/logout",auth,logout);

module.exports = router;