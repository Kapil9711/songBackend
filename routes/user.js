import { Router } from "express";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/user.js";
import CustomError from "../utils/customError.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
const router = Router();

router.route("/").get(isAuthenticatedUser, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new CustomError(404, "User Not Found"));
  res
    .status(200)
    .json({ success: true, message: "User found Successfully", user });
});

// create user => /user
router.route("/").post(
  catchAsyncError(async (req, res, next) => {
    const { username, email, password } = req.body;
    const isExist = await User.findOne({ email });
    if (isExist) return next(new CustomError(400, "User Already Exist"));
    const user = await User.create(req.body);
    res.status(201).json({ success: true, user });
  })
);

// login user => /user/login
router.route("/login").post(
  catchAsyncError(async (req, res, next) => {
    const { username, email, password } = req.body;
    const isExist = await User.findOne({
      $or: [{ username: username }, { email: email }],
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

router.route("/").delete(async (req, res, next) => {});

export default router;
