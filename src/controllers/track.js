const Track = require("../models/track");
const Artist = require("../models/artist");
const Album = require("../models/album");
const Favorite = require("../models/favorite");
const User = require("../models/user");

exports.getTracks = async (req, res) => {
  try {
    const { limit = 5, offset = 0, artist_id, album_id, hidden } = req.query;

    // Bad Request, Invalid query parameters
    if (isNaN(limit) || limit < 0 || isNaN(offset) || offset < 0) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    let artist, album;
    // If Artist not found
    if (artist_id) {
      artist = await Artist.findById(artist_id);
      if (!artist) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: "Artist not found.",
          error: null,
        });
      }
    }

    // If Album not found
    if (album_id) {
      album = await Album.findById(album_id);
      if (!album) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: "Album not found.",
          error: null,
        });
      }
    }

    // Prepare filter according to query parameters
    const query = {};

    if (artist_id) {
      query.artist = artist_id;
    }
    if (album_id) {
      query.album = album_id;
    }
    if (hidden !== undefined && hidden !== null) {
      query.hidden = hidden;
    }

    // Fetch Tracks
    const tracks = await Track.find(query)
      .populate({ path: "artist", select: "name" })
      .populate({ path: "album", select: "name" })
      .skip(offset)
      .limit(limit);

    const outputResponse = tracks.map((track) => ({
      track_id: track._id,
      artist_name: track.artist.name,
      album_name: track.album.name,
      name: track.name,
      duration: track.duration,
      hidden: track.hidden,
    }));

    // Return Success Response
    return res.status(200).json({
      status: 200,
      data: outputResponse,
      message: "Tracks retrieved successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving tracks details",
      error: err,
    });
  }
};

exports.getTrack = async (req, res) => {
  try {
    const trackId = req.params.id;

    // Check missing parameters
    if (!trackId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Retrieve track
    const track = await Track.findById(trackId)
      .populate({ path: "artist", select: "name" })
      .populate({ path: "album", select: "name" });

    // If the given track not found
    if (!track) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Track not found",
        error: null,
      });
    }

    // Return success response
    return res.status(200).json({
      state: 200,
      data: {
        track_id: track._id,
        artist_name: track.artist.name,
        album_name: track.album.name,
        name: track.name,
        duration: track.duration,
        hidden: track.hidden,
      },
      message: "Track fetched successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving track details",
      error: err,
    });
  }
};

exports.addTrack = async (req, res) => {
  try {
    const { artist_id, album_id, name, duration, hidden } = req.body;

    // Check missing fields
    if (
      !artist_id ||
      !album_id ||
      !name ||
      !duration ||
      !hidden ||
      (duration && isNaN(duration))
    ) {
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

    // Check if album exists
    const album = await Album.findById(album_id);

    if (!album) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    // Create track
    await Track.create({
      name,
      duration,
      artist: artist_id,
      album: album_id,
      hidden,
    });

    // Return success response
    return res.status(201).json({
      state: 201,
      data: null,
      message: "Track created successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while creating Track",
      error: err,
    });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const trackId = req.params.id;

    const allowedFieldsToUpdate = ["name", "duration", "hidden"];

    const updatedData = req.body;

    // If the request body contains any invalid fields to update
    const isValidUpdate = Object.keys(updatedData).every((field) =>
      allowedFieldsToUpdate.includes(field)
    );

    // Check missing parameters
    if (!trackId || !isValidUpdate || Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if the given track exist
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    // Update Track
    await Track.findByIdAndUpdate(
      trackId,
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
      message: "Track updated successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while updating track",
      error: err,
    });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const trackId = req.params.id;

    // Bad Request, trackId not present
    if (!trackId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // If the given track not found
    const track = await Track.findById(trackId);

    if (!track) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    // Find and delete the favorite document while ensuring all references are removed
    const favoriteToDelete = await Favorite.findOne({ item_id: trackId });

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

    // Delete Track
    await Track.findByIdAndDelete(trackId);

    // Return success response
    return res.status(200).json({
      state: 200,
      data: null,
      message: `Track:${track.name} deleted successfully.`,
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while deleting track",
      error: err,
    });
  }
};
