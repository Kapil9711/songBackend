import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
