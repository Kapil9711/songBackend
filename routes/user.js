import { Router } from "express";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.js";
import CustomError from "../utils/customError.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import upload from "../config/mutlerConfig.js";
import uploadImage from "../utils/uploadImage.js";
import Friend from "../models/friend.js";
const { fileTypeFromBuffer } = await import("file-type");

const router = Router();

router.route("/").get(isAuthenticatedUser, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new CustomError(404, "User Not Found"));
  res
    .status(200)
    .json({ success: true, message: "User found Successfully", user });
});

router.route("/all").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    if (!req.user) return next(new CustomError(404, "User not Found"));
    const isExist = await User.findOne({ _id: req.user.id });
    if (!isExist) return next(new CustomError(404, "User not Exists"));

    const users = await User.find({ _id: { $ne: isExist._id } });

    const friends = await Friend.find(
      {
        $or: [{ recipient: isExist._id }, { requester: isExist._id }],
        $or: [{ status: "accepted" }, { status: "pending" }],
      },
      "_id recipient requester"
    );
    let formatedData = [];
    users.forEach((item) => {
      friends.forEach((fr) => {
        if (item._id != fr.recipient && item._id != fr.requester) {
          formatedData.push(item);
        }
      });
    });

    res
      .status(200)
      .json({ success: true, message: "User Found", users: formatedData });
  })
);

// create user => /user
router.route("/").post(
  catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const isExist = await User.findOne({ email });
    if (isExist) return next(new CustomError(400, "User Already Exist"));
    const user = await User.create(req.body);
    res.status(201).json({ success: true, user });
  })
);

// login user => /user/login
router.route("/login").post(
  catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const isExist = await User.findOne({
      $or: [{ name: name }, { email: email }],
    });
    if (!isExist) return next(new CustomError(404, "User not Found"));
    const isPasswordMatched = await isExist.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new CustomError(400, "UserName or Password Incorrect"));
    }
    const token = isExist.getJwtToken();
    return res.status(200).json({
      success: true,
      message: "Login successfull",
      token,
      user: isExist,
    });
  })
);

router.route("/").put(isAuthenticatedUser, async (req, res, next) => {
  const {
    songQuality,
    downloadQuality,
    imageQuality,
    isFavouritePublic,
    numberOfSongLoad,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return next(new CustomError(400, "User Not Found"));

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      songQuality,
      downloadQuality,
      imageQuality,
      isFavouritePublic,
      numberOfSongLoad,
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "User Updated Successfully",
    user: updatedUser,
  });
});

router.route("/image").post(
  isAuthenticatedUser,
  upload.single("image"),
  catchAsyncError(async (req, res, next) => {
    if (!req.user) return next(new CustomError(400, "User Not Found"));
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError(400, "User Not Found"));
    if (!req.file) return next(new CustomError(400, "No File Uploaded"));
    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType || !fileType.mime.startsWith("image/")) {
      return next(new CustomError(400, "Please Upload an Image"));
    }
    const imageUrl = await uploadImage(req.file.buffer);
    user.image = imageUrl;
    await user.save();
    if (!imageUrl) return next(new CustomError(500, "Image not uploaded"));
    return res.status(201).json({
      success: true,
      image: imageUrl,
      message: "Image Uploaded Successfully",
      user,
    });
  })
);

router.route("/").delete(async (req, res, next) => {});

export default router;
