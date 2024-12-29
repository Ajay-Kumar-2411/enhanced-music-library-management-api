const express = require("express");

const router = express.Router();
const {
  getArtists,
  getArtist,
  addArtist,
  updateArtist,
  deleteArtist,
} = require("../controllers/artist");
const { auth, isAdmin, isEditorOrAdmin } = require("../middlewares/auth");

router.get("/artists", auth, getArtists);
router.get("/artists/:id", auth, getArtist);
router.post("/artists/add-artist", auth, isAdmin, addArtist);
router.put("/artists/:id", auth, isEditorOrAdmin, updateArtist);
router.delete("/artists/:id", auth, isEditorOrAdmin, deleteArtist);

module.exports = router;
