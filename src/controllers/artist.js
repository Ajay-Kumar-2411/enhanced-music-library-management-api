const Artist = require("../models/artist");
const Favorite = require("../models/favorite");
const User = require("../models/user");

exports.getArtists = async (req, res) => {
  try {
    const { limit = 5, offset = 0, grammy, hidden } = req.query;

    // Bad Request, Invalid query parameters
    if (
      isNaN(limit) ||
      limit < 0 ||
      isNaN(offset) ||
      offset < 0 ||
      (grammy && isNaN(grammy))
    ) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Prepare filter according to query parameters
    const query = {};

    if (grammy !== null && grammy !== undefined) {
      query.grammy = grammy;
    }

    if (hidden !== null && hidden !== undefined) {
      query.hidden = hidden;
    }

    // Retrieve artists details
    const artists = await Artist.find(query).skip(offset).limit(limit);

    const outputResponse = artists.map((artist) => ({
      artist_id: artist._id,
      name: artist.name,
      grammy: artist.grammy,
      hidden: artist.hidden,
    }));

    // Return Success Response
    return res.status(200).json({
      status: 200,
      data: outputResponse,
      message: "Artists retrieved successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving artists details",
      error: err,
    });
  }
};

exports.getArtist = async (req, res) => {
  try {
    const artistId = req.params.id;

    // Check missing parameters
    if (!artistId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // If the artist doesn't exist
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Artist not found",
        error: null,
      });
    }

    // Return success response
    return res.status(200).json({
      state: 200,
      data: {
        artist_id: artist._id,
        name: artist.name,
        grammy: artist.grammy,
        hidden: artist.hidden,
      },
      message: "Artist retrieved successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving artist details",
      error: err,
    });
  }
};

exports.addArtist = async (req, res) => {
  try {
    const { name, grammy, hidden } = req.body;

    // Check missing fields
    if (!name || !grammy || !hidden || isNaN(grammy)) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Create artist in the database
    await Artist.create({
      name,
      grammy,
      hidden,
    });

    // Return success response
    return res.status(201).json({
      state: 201,
      data: null,
      message: "Artist created successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while creating artist",
      error: err,
    });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const artistId = req.params.id;

    const allowedFieldsToUpdate = ["name", "grammy", "hidden"];

    const updatedData = req.body;

    // If the request body contains any invalid fields to update
    const isValidUpdate = Object.keys(updatedData).every((field) =>
      allowedFieldsToUpdate.includes(field)
    );

    // Bad Request
    if (
      !artistId ||
      !isValidUpdate ||
      Object.keys(updatedData).length === 0 ||
      (updatedData.grammy && isNaN(updatedData.grammy))
    ) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if the given artist exists
    const artist = await Artist.findById(artistId);

    if (!artist) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    // Update artist
    await Artist.findByIdAndUpdate(
      artistId,
      {
        $set: updatedData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.sendStatus(204);
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while updating artist",
      error: err,
    });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artistId = req.params.id;

    // Bad Request, artistId not present
    if (!artistId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if the given Artist not found
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    // Find and delete the favorite document while ensuring all references are removed
    const favoriteToDelete = await Favorite.findOne({ item_id: artistId });

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

    // Delete Artist
    await Artist.findByIdAndDelete(artistId);

    return res.status(200).json({
      state: 200,
      data: {
        artist_id: artistId,
      },
      message: `Artist:${artist.name} deleted successfully.`,
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while deleting artist",
      error: err,
    });
  }
};
