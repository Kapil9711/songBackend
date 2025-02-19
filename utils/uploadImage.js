import cloudinary from "../config/cloudnaryConfig.js";

// Upload image directly from buffer
const uploadImage = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "uploads", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Image Upload Error:", error);
          reject(error);
        } else {
          resolve(result.secure_url); // Return image URL correctly
        }
      }
    );
    stream.end(fileBuffer); // Send the file buffer to Cloudinary
  });
};
export default uploadImage;
