import mongoose from "mongoose";

// Define the FavoriteSong schema
const playlistSchema = new mongoose.Schema(
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
    songs: {
      type: [
        {
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
      ],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the FavoriteSong model
const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
