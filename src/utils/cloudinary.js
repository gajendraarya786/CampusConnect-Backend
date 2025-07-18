import dotenv from 'dotenv';
dotenv.config(); 

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' //fs = file system

 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '****' : 'MISSING'
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      secure: true, // <--- always get HTTPS URL
    });
    // file has been uploaded successfully
    console.log("file has been uploaded successfully", response.secure_url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath); // removes the locally saved temporary file as the upload operation got failed
    return null;
  }
};


export {uploadOnCloudinary};