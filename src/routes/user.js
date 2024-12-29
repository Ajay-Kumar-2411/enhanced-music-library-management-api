const express = require("express");

const router = express.Router();
const {
  getUsers,
  addUser,
  deleteUser,
  updatePassword,
} = require("../controllers/user");
const { auth, isAdmin } = require("../middlewares/auth");

router.get("/users", auth, getUsers);
router.post("/users/add-user", auth, isAdmin, addUser);
router.delete("/users/:id", auth, isAdmin, deleteUser);
router.put("/users/update-password", auth, updatePassword);

module.exports = router;