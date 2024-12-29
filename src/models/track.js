const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    hidden: {
      type: Boolean,
      required: true,
      default: false,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Track", trackSchema);
