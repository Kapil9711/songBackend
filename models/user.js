import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/secret.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."], // Custom error message for name
  },
  email: {
    type: String,
    required: [true, "Email is required."], // Custom error message for email
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required."], // Custom error message for password
    minlength: [5, "Password must be at least 10 characters long."], // Custom error message for password length
  },
  songQuality: {
    type: Number,
    enum: {
      message: "Please select a valid  songQuality",
      values: [0, 1, 2, 3, 4],
    },
    default: 4,
  },
  downloadQuality: {
    type: Number,
    enum: {
      message: "Please select a valid downloadQuality",
      values: [0, 1, 2, 3, 4],
    },
    default: 4,
  },
  imageQuality: {
    type: Number,
    enum: {
      message: "Please select a valid downloadQuality",
      values: [0, 1, 2],
    },
    default: 2,
  },
  isFavouritePublic: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
  numberOfSongLoad: {
    type: Number,
    enum: {
      values: [40, 60, 80, 100, 200],
      message: "Select Valid Number of SongToLoad",
    },
    default: 40,
  },
  friend: {
    type: [mongoose.Types.ObjectId],
  },
  friendRequest: {
    type: [mongoose.Types.ObjectId],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Return JSON Web Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_TIME,
  });
};

// Compare user password in database password
userSchema.methods.comparePassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
