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
    const {userId} = req.query;
    const filter = {};
    if(userId) filter.author = userId;

    const posts = await Post.find(filter).populate('author', ' fullname username avatar').sort({ createdAt: -1 });
    return res.status(200).json(
      new ApiResponse(200, posts, 'Posts fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

const deletePost = async(req, res, next) => {
   try {
     const {postId} = req.params;
     const userId = req.user._id;

     const post = await Post.findById(postId);
     if(!post){
       throw new ApiError('404', "Post not found");
     }
     if(post.author.toString() !== userId.toString()){
       throw new ApiError(403, "Not authorized to delete the post");
     }
     await post.deleteOne();
     return res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
   } catch (err) {
      next(err)
   }
}
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

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = {
      user: userId, 
      content,
      createdAt: new Date()
    };

    post.comments = post.comments || [];
    post.comments.push(comment);
    await post.save();

    // Populate user for response
    const populatedComment = await Post.findOne(
      { _id: postId },
      { comments: { $slice: -1 } }
    ).populate('comments.user', 'fullname avatar');

    res.status(201).json({ data: populatedComment.comments[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate('comments.user', 'fullname avatar')
      .select('comments');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Optionally sort comments by createdAt (if needed)
    const sortedComments = (post.comments || []).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    res.status(200).json({ data: sortedComments });
  } catch (err) {
    next(err);
  }
};
 
const deleteComment = async(req, res, next) => {
  try{
   const {postId, commentId} = req.params;
   const userId = req.user._id;

   const post = await Post.findById(postId);
   if(!post){
      throw new ApiError(404, "Post not found")
   }
   const comment = post.comments.id(commentId);
   if(!comment) {
      throw new ApiError(404, "Comment not found");
   }

   if(comment.user.toString() !== userId.toString()){
      throw new ApiError(404, "Not authorized to delete this comment");
   }
   await comment.deleteOne();
   await post.save();

   return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
}
   catch(err){
     next(err);
   }
} 

export {createPost, 
        getPosts, 
        deletePost,
        togglePostLike, 
        addComment, 
        getComments,
        deleteComment
      };


