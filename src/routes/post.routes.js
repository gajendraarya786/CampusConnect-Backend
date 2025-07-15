import { Router } from "express";
import { createPost,getComments, deletePost, getPosts, togglePostLike, addComment, deleteComment } from "../controllers/post.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router =Router();

router.route('/').post(
    verifyAccessToken,
    upload.fields([
        {name: 'images', maxCount: 10},
        { name: "videos", maxCount: 5 }
    ]),
    createPost
);
router.route('/').get(verifyAccessToken, getPosts);
router.route('/:postId').delete(verifyAccessToken, deletePost);
router.route('/:postId/like').post(verifyAccessToken, togglePostLike);
router.route('/:postId/unlike').delete(verifyAccessToken, togglePostLike);
router.route('/:postId/comments').post(verifyAccessToken, addComment);
router.route('/:postId/comments').get(verifyAccessToken, getComments);
router.route('/:postId/comments/:commentId').delete(verifyAccessToken, deleteComment);

export default router;