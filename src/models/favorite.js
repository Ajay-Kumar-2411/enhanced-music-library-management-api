const mongoose = require("mongoose");
const User = require("../models/user");

const favoriteSchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["artist", "album", "track"],
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.post("findOneAndDelete", async function (deletedFavorite) {
  if (deletedFavorite) {
    const favoriteId = deletedFavorite._id;
    await User.updateMany(
      { favorites: favoriteId },
      { $pull: { favorites: favoriteId } }
    );
  }
});

module.exports = mongoose.model("Favorite", favoriteSchema);
