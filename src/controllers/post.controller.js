import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = async (req, res, next) => {
    try{
        const { title, content, tags, category: reqCategory, visibility, location, scheduledAt } = req.body;
        const userId = req.user?._id;
        if(!userId){
            throw new ApiError(401, 'Unauthorized');
        }
        if(!title || !content){
            throw new ApiError(400, 'title and content are required');
        }

         // Handle category to allow schema default if not provided or empty
        const category = (reqCategory === '' || reqCategory === undefined) ? undefined : reqCategory;

        const images = req.files?.images || [];
        const videos = req.files?.videos || [];

        const uploadedImages = await Promise.all(
            images.map(async(image) => {
                const result = await uploadOnCloudinary(image.path);
                if(!result?.url){
                    throw new ApiError(400, `Failed to upload the image: ${image.originalname}`);
                }
                return {
                    url: result.url,
                    alt: image.originalname,
                    caption: image.originalname
                }
            })
        );
        const uploadedVideos = await Promise.all(
            videos.map(async (video) => {
               const result = await uploadOnCloudinary(video.path);
               if (!result?.url) {
                 throw new ApiError(400, `Failed to upload video: ${video.originalname}`);
               }
               return {
                  url: result.url,
                  thumbnail: result.thumbnail_url,
                  duration: result.duration
              };
          })
       );
       
    console.log('DEBUG: userId before Post.create:', userId);
    console.log('DEBUG: uploadedImages before Post.create:', uploadedImages);
    console.log('DEBUG: uploadedVideos before Post.create:', uploadedVideos);

       const post = await Post.create({
        title,
        content,
        author: userId,
        images: uploadedImages,
        videos: uploadedVideos,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category,
        visibility,
        location,
        scheduledAt
       });
       return res.status(201).json(
        new ApiResponse(201, post, 'Post created successfully')
       );
    }
    catch(error){
       next(error);
    }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('author', 'username name avatar').sort({ createdAt: -1 });
    return res.status(200).json(
      new ApiResponse(200, posts, 'Posts fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};
const togglePostLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    const isLiked = post.likes.some(like => like.user.toString() === userId.toString());

    if (req.method === 'POST') { // Like action
      if (isLiked) {
        throw new ApiError(409, 'Post already liked');
      }
      post.likes.push({ user: userId, likedAt: new Date() });
    } else if (req.method === 'DELETE') { // Unlike action
      if (!isLiked) {
        throw new ApiError(409, 'Post not liked yet');
      }
      post.likes = post.likes.filter(like => like.user.toString() !== userId.toString());
    }

    await post.save();

    return res.status(200).json(
      new ApiResponse(200, { likes: post.likes.length }, 'Like status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export {createPost, getPosts, togglePostLike};


