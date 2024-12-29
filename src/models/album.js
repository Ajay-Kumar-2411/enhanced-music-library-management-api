const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    year: {
      type: Number,
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
      default: false,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Album", albumSchema);
