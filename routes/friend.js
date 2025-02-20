import { Router } from "express";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import Friend from "../models/friend.js";
import mongoose, { isValidObjectId } from "mongoose";
import CustomError from "../utils/customError.js";
import User from "../models/user.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
const router = Router();

// get friend requests => /friend/request
router.route("/request").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const recipient = await User.findById(req.user._id);
    if (!recipient) return next(new CustomError(401, "Not Authorized"));
    const requests = await Friend.find(
      { recipient, status: "pending" },
      "_id requester"
    ).populate({ path: "requester", select: "name email image" });
    return res.status(200).json({ success: true, friendRequests: requests });
  })
);

// get friends => /friend
router.route("/").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError(401, "Not Authorized"));
    const friends = await Friend.find(
      {
        $or: [{ recipient: user._id }, { requester: user._id }],
        status: "accepted",
      },
      "_id recipient requester"
    );
    const friendId = friends.map((item) => {
      if (item.requester !== user.id) return { _id: item.requester };
      if (item.recipient !== user.id) return { _id: item.recipient };
    });
    const allFriends = await User.find(
      {
        $or: friendId,
      },
      "_id name email image"
    );
    let formatedData = friends.map((item, idx) => {
      let fr = allFriends[idx];
      return { _id: item.id, user: fr };
    });
    // const friends = await Friend.find({
    //   $or: [{ recipient: user }, { requester: user }],
    //   status: "accepted",
    // })
    //   .populate({ path: "recipient", select: "name email image" })
    //   .populate({ path: "requester", select: "name email image" });

    // const friends = await Friend.aggregate([
    //   {
    //     $match: {
    //       $or: [{ recipient: user }, { requester: user }],
    //       status: "accepted",
    //     },
    //   },
    //   //   {
    //   //     $lookup: {
    //   //       from: "users",
    //   //       localField: "recipient",
    //   //       foreignField: "_id",
    //   //       as: "recipientDetails",
    //   //     },
    //   //   },
    //   //   {
    //   //     $unwind: {
    //   //       path: "$recipientDetails",
    //   //       preserveNullAndEmptyArrays: true,
    //   //     },
    //   //   },
    //   //   {
    //   //     $lookup: {
    //   //       from: "users",
    //   //       localField: "requester",
    //   //       foreignField: "_id",
    //   //       as: "requesterDetails",
    //   //     },
    //   //   },
    //   //   {
    //   //     $unwind: {
    //   //       path: "$requesterDetails",
    //   //       preserveNullAndEmptyArrays: true,
    //   //     },
    //   //   },
    //   //   {
    //   //     $project: {
    //   //       status: 1,
    //   //       "recipientDetails.name": 1,
    //   //       "recipientDetails.email": 1,
    //   //       "recipientDetails.image": 1,
    //   //       "requesterDetails.name": 1,
    //   //       "requesterDetails.email": 1,
    //   //       "requesterDetails.image": 1,
    //   //     },
    //   //   },
    // ]);
    return res.status(200).json({ success: true, friends: formatedData });
  })
);

// create friend
router.route("/").post(
  catchAsyncError(async (req, res, next) => {
    const { requester, recipient } = req.body;
    if (!isValidObjectId(requester) || !isValidObjectId(recipient)) {
      return next(new CustomError(400, "Invalid Ids"));
    }
    const isRequesterExist = await User.findById(requester);
    const isRecipientExist = await User.findById(recipient);

    if (!isRequesterExist || !isRecipientExist) {
      return next(new CustomError(400, "Invalid userId"));
    }
    const friend = await Friend.create({ requester, recipient });
    res
      .status(201)
      .json({ success: true, message: "Friend Request Sent", friend });
  })
);

// update friend
router.route("/:id").put(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;
    if (!isValidObjectId(id))
      return next(new CustomError(400, "Invalid Friend Id"));

    const isExist = await Friend.findOne({ _id: id, recipient: req.user._id });
    if (!isExist) return next(new CustomError(404, "Friend Not Found"));

    const updatedFriend = await Friend.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(201).json({
      success: true,
      message: "Friend Request Updated",
      friend: updatedFriend,
    });
  })
);

export default router;
