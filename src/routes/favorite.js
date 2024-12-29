const express = require("express");

const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favorite");
const { auth } = require("../middlewares/auth");

router.get("/favorites/:category", auth, getFavorites);
router.post("/favorites/add-favorite", auth, addFavorite);
router.delete("/favorites/remove-favorite/:id", auth, removeFavorite);

module.exports = router;