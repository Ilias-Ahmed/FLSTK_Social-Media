import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "default_cloud_name", // Fallback value
  api_key: process.env.CLOUDINARY_API_KEY || "default_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "default_api_secret",
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Configure multer upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Utility function to upload to Cloudinary
export const uploadToCloudinary = async (file, folder = "social_media_app") => {
  try {
    if (!file) throw new Error("No file provided");

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder, // Dynamic folder support
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Handle the buffer upload
      uploadStream.end(file.buffer);
    });

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Image upload failed. Please try again."); // Hide internal details in production
  }
};

// Utility function to delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    // If no publicId is provided, return early without throwing an error
    if (!publicId) {
      return { success: true, message: "No image to delete" };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log("Cloudinary deletion skipped:", error.message);
    // Return a success response even if deletion fails
    return { success: true, message: "Image deletion skipped" };
  }
};
