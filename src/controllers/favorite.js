const Artist = require("../models/artist");
const Album = require("../models/album");
const Track = require("../models/track");
const User = require("../models/user");
const Favorite = require("../models/favorite");

exports.getFavorites = async (req, res) => {
  try {
    const { limit = 5, offset = 0 } = req.query;
    const category = req.params.category;

    // If the request body contains any invalid categories
    const validCategories = ["artist", "album", "track"];

    // Bad Request, Invalid query parameters
    if (
      !category ||
      isNaN(limit) ||
      limit < 0 ||
      isNaN(offset) ||
      offset < 0 ||
      !validCategories.includes(category)
    ) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Retrieve user favorite items
    const user = await User.findById(req.user.id)
      .select("favorites")
      .populate("favorites");

    if (!user) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    const outputResponse = user.favorites.map((favorite) => ({
      favorite_id: favorite._id,
      category: favorite.category,
      item_id: favorite.item_id,
      name: favorite.name,
      created_at: favorite.createdAt,
    }));

    // Return success response
    return res.status(200).json({
      state: 200,
      data: outputResponse,
      message: "Favorites retrieved successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while retrieving favorites",
      error: err,
    });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { item_id, category } = req.body;

    // If the request body contains any invalid category to add
    const allowedCategory = ["artist", "track", "album"];

    // Bad Request, missing fields
    if (!item_id || !category || !allowedCategory.includes(category)) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "User not found",
        error: err,
      });
    }

    // Check if the item exists in the corresponding collection
    const model = category.charAt(0).toUpperCase() + category.slice(1);

    let itemExists;
    if (model === "Album") {
      itemExists = await Album.findById(item_id);
    } else if (model === "Artist") {
      itemExists = await Artist.findById(item_id);
    } else if (model === "Track") {
      itemExists = await Track.findById(item_id);
    }
    if (!itemExists) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Item not found in this category.",
        error: null,
      });
    }

    const favorite = await Favorite.findOne({ item_id });

    // Check if the given favorite is already present in favorite
    if (user.favorites.includes(favorite?._id)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "The given item is already present in the favorite",
        error: null,
      });
    }

    // Create favorite document
    let newFavorite;
    if (!favorite) {
      newFavorite = await Favorite.create({
        item_id,
        category,
        name: itemExists.name,
      });
    }

    // Add Favorite item in the user list
    user.favorites.push(favorite ? favorite._id : newFavorite._id);
    await user.save();

    // Return success response
    return res.status(201).json({
      status: 201,
      data: null,
      message: "Favorite added successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while adding favorite",
      error: err,
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const favoriteId = req.params.id;

    // Check missing parameters
    if (!favoriteId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // If favorite is not present
    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "Favorite not found.",
        error: null,
      });
    }

    // Remove favorite from user favorite list

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { favorites: favoriteId },
      },
      { new: true, runValidators: true }
    );

    // Return success response
    return res.status(200).json({
      state: 200,
      data: null,
      message: "Favorite removed successfully",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while removing favorite",
      error: err,
    });
  }
};