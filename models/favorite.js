import mongoose from "mongoose";

// Define the FavoriteSong schema
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: [{ quality: String, url: String }],
      required: true,
    },
    downloadUrl: {
      type: [{ quality: String, url: String }],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the FavoriteSong model
const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
