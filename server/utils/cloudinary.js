import {v2 as cloudinary} from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

//check and load env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {resource_type: "auto"});
        return uploadResponse;
    } catch (error) {
        console.log("Error uploading media to Cloudinary:", error);

    }
}


export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const deleteResponse = await cloudinary.uploader.destroy(publicId);
        return deleteResponse;
    } catch (error) {
        console.log("Error deleting media from Cloudinary:");
        console.log(error);
    }
}

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        const deleteResponse = await cloudinary.uploader.destroy(publicId, {resource_type: "video"});
        return deleteResponse;
    } catch (error) {
        console.log("Error deleting video from Cloudinary:");
        console.log(error);
    }
}
