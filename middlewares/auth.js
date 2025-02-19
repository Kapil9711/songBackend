import jwt from "jsonwebtoken";
import User from "../models/user.js";
import catchAsyncErrors from "./catchAsyncError.js";
import CustomError from "../utils/customError.js";
import secret from "../config/secret.js";

// Check if the user is authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError(401, "Login first to access this resource."));
  }

  const decoded = jwt.verify(token, secret.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

// handling users roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          403,
          `Role(${req.user.role}) is not allowed to access this resource.`
        )
      );
    }
    next();
  };
};
