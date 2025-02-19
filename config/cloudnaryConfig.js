import { v2 as cloudinary } from "cloudinary";
import secret from "./secret.js";

cloudinary.config({
  cloud_name: secret.CLOUDINARY_CLOUD_NAME,
  api_key: secret.CLOUDINARY_API_KEY,
  api_secret: secret.CLOUDINARY_API_SECRET,
});

export default cloudinary;
