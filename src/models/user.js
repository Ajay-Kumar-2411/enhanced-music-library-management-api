const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Editor", "Viewer"],
      default: "Viewer",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Favorite",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
