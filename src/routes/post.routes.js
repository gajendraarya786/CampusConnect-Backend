import { Router } from "express";
import { createPost, getPosts } from "../controllers/post.controller.js";
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

export default router;