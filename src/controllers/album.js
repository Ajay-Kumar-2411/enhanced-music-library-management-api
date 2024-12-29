const Album = require("../models/album");
const Artist = require("../models/artist");
const Favorite = require("../models/favorite");
const User = require("../models/user");

exports.getAlbums = async (req, res) => {
  try {
    const { limit = 5, offset = 0, artist_id, hidden } = req.query;

    // Bad Request, Invalid query parameters
    if (isNaN(limit) || limit < 0 || isNaN(offset) || offset < 0) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // If Artist not found
    if (artist_id) {
      const artist = await Artist.findById(artist_id);
      if (!artist) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: "Artist not found, not valid artist ID.",
          error: null,
        });
      }
    }

    // Preparing filters according to query parameters
    const query = {};

    if (artist_id) {
      query.artist = artist_id;
    }
    if (hidden !== undefined && hidden !== null) {
      query.hidden = hidden;
    }

    // Fetch Artists
    const albums = await Album.find(query)
      .populate({ path: "artist", select: "name" })
      .skip(offset)
      .limit(limit);

    const outputResponse = albums.map((album) => ({
      album_id: album._id,
      artist_name: album.artist.name,
      name: album.name,
      year: album.year,
      hidden: album.hidden,
    }));

    // Return Success Response
    return res.status(200).json({
      status: 200,
      data: outputResponse,
      message: "Albums fetched successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving albums details",
      error: err,
    });
  }
};

exports.getAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;

    // Check missing parameter
    if (!albumId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if album doesn't exist
    const album = await Album.findById(albumId).populate({
      path: "artist",
      select: "name",
    });

    if (!album) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Album not found",
        error: null,
      });
    }

    // Return success response
    return res.status(200).json({
      state: 200,
      data: {
        album_id: album._id,
        artist_name: album.artist.name,
        name: album.name,
        year: album.year,
        hidden: album.hidden,
      },
      message: "Album fetched successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving album details",
      error: err,
    });
  }
};

exports.addAlbum = async (req, res) => {
  try {
    const { artist_id, name, year, hidden } = req.body;

    // Check missing fields
    if (!artist_id || !name || !year || !hidden) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if artist exists
    const artist = await Artist.findById(artist_id);

    if (!artist) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    // Create album
    await Album.create({
      name,
      year,
      artist: artist_id,
      hidden,
    });

    // Return success response
    return res.status(201).json({
      state: 201,
      data: null,
      message: "Album created successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while creating album",
      error: err,
    });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;

    const allowedFieldsToUpdate = ["name", "year", "hidden"];

    const updatedData = req.body;

    // If the request body contains any invalid fields to update
    const isValidUpdate = Object.keys(updatedData).every((field) =>
      allowedFieldsToUpdate.includes(field)
    );

    // Check missing fields
    if (!albumId || !isValidUpdate || Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if album exists
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    // Update album
    await Album.findByIdAndUpdate(
      albumId,
      {
        $set: updatedData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Return success response
    return res.status(204).json({
      state: 204,
      data: null,
      message: "Album updated successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while updating album",
      error: err,
    });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const albumId = req.params.id;

    // Bad Request, albumId not present
    if (!albumId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // If Album not found
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    
    // Find and delete the favorite document while ensuring all references are removed
    const favoriteToDelete = await Favorite.findOne({ item_id: albumId });

    if (favoriteToDelete) {
      const favoriteId = favoriteToDelete._id;

      // Remove the favoriteId from all user documents' favorites array
      await User.updateMany(
          { favorites: favoriteId },
          { $pull: { favorites: favoriteId } }
        );
        
        // Delete the favorite document
        await Favorite.findByIdAndDelete(favoriteId);
      }
      
      // Delete Album
      await Album.findByIdAndDelete(albumId);

    // Return success response
    return res.status(200).json({
      state: 200,
      data: null,
      message: `Album:${album.name} deleted successfully.`,
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while deleting album",
      error: err,
    });
  }
};
