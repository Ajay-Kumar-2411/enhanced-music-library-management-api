const express = require("express");

const router = express.Router();
const {
  getAlbums,
  getAlbum,
  addAlbum,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/album");
const { isEditorOrAdmin, isAdmin, auth } = require("../middlewares/auth");

router.get("/albums", auth, getAlbums);
router.get("/albums/:id", auth, getAlbum);
router.post("/albums/add-album", auth, isAdmin, addAlbum);
router.put("/albums/:id", auth, isEditorOrAdmin, updateAlbum);
router.delete("/albums/:id", auth, isEditorOrAdmin, deleteAlbum);

module.exports = router;
