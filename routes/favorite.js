import { Router } from "express";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import Favorite from "../models/favorite.js";
import User from "../models/user.js";
import CustomError from "../utils/customError.js";
const router = Router();

// get favorite /favorite
router.route("/").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError(404, "Please Login"));
    const favorite = await Favorite.find({ userId: user._id });
    return res.status(200).json({ success: true, favorite });
  })
);

// get favorite /favorite
router.route("/:userId").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) return next(new CustomError(404, "Please Login"));

    const requestedUser = await User.findById(userId);
    if (!requestedUser)
      return next(new CustomError(404, "Requested User do not exist"));

    if (!requestedUser.isFavouritePublic) {
      return next(new CustomError(404, "Not Allowed By the Requested user"));
    }
    const favorite = await Favorite.find({ userId: requestedUser._id });
    return res.status(200).json({ success: true, favorite });
  })
);

//create favorite => /favorite
router.route("/").post(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { name, image, downloadUrl, id } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return next(new CustomError(404, "Please Login"));
    const isExist = await Favorite.findOne({ id, userId: user._id });

    if (isExist) {
      await Favorite.findOneAndDelete({ id });
      console.log(name, "removed");
      return res
        .status(200)
        .json({ success: true, message: "Favorite Removed successfully" });
    }

    const favorite = await Favorite.create({
      name,
      image,
      downloadUrl,
      id,
      userId: user._id,
    });
    console.log(name, "added");

    res.status(201).json({
      success: true,
      message: "Added to Favorite Successfully",
      favorite,
    });
  })
);

//delete favorite => /favorite
router.route("/").delete(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError(404, "Please Login"));
    await Favorite.findOneAndDelete({ id, userId: user._id });
    return res
      .status(200)
      .json({ success: true, message: "Favorite deleted Successfully" });
  })
);

export default router;
