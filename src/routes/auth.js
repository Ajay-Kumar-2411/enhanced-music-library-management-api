const express = require("express");

const router = express.Router();
const { logout, login, signup } = require("../controllers/auth");
const { auth } = require("../middlewares/auth");

router.get("/logout", auth, logout);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
