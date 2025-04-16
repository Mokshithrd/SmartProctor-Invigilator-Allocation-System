const express = require('express');
const router = express.Router();

const {login} = require("../controllers/loginController");
const {logout} = require("../controllers/logoutController");
const {auth} = require("../middleware/authMiddleware");
const { userLogin } = require('../controllers/userLogin');

router.post("/login",login);
router.post("/logout",logout);
router.get("/me", auth, userLogin);

module.exports = router;