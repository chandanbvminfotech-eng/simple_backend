import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
dotenv.config({
  path: "./.env",
  quiet: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Uploaded to Cloudinary:", response.url);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (err) {
    // ❗ delete file if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.error("Cloudinary upload error:", err);
    return null;
  }
};

const deleteFromCloudinary = async (databaseFilePath) => {
  try {
    if (!databaseFilePath) {
      throw new ApiError(400, "Please provide a file path to delete");
    }
    const spreadedUrl = databaseFilePath.split("/");
    const getPublicId = spreadedUrl[spreadedUrl.length - 1];
    const publicId = getPublicId.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId);

    console.log("Deleted from cloudinary");

    if (fs.existsSync(databaseFilePath)) {
      fs.unlinkSync(databaseFilePath);
    }
    return response;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
};

export { uploadOnCloudinary,deleteFromCloudinary };
