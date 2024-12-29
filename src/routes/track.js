const express = require("express");

const router = express.Router();
const {
  getTracks,
  getTrack,
  addTrack,
  updateTrack,
  deleteTrack,
} = require("../controllers/track");
const { isAdmin, isEditorOrAdmin, auth } = require("../middlewares/auth");

router.get("/tracks", auth, getTracks);
router.get("/tracks/:id", auth, getTrack);
router.post("/tracks/add-track", auth, isAdmin, addTrack);
router.put("/tracks/:id", auth, isEditorOrAdmin, updateTrack);
router.delete("/tracks/:id", auth, isEditorOrAdmin, deleteTrack);

module.exports = router;