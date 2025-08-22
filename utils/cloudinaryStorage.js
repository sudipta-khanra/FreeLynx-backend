// server/utils/cloudinaryStorage.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config(); // load environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars", // folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // allowed file formats
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Export multer parser
export const parser = multer({ storage });
