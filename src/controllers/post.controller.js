import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = async (req, res, next) => {
    try{
        const {title, content, tags, category, visibility, location, scheduledAt} = req.body;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401, 'Unauthorized');
        }
        if(!title || !content){
            throw new ApiError(400, 'title and content are required');
        }

        const images = req.files?.images || [];
    }
    catch(err){

    }
};


