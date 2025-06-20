import { Router } from "express";
import { loginUser, registerUser, getUserProfile, getUserById, sendFriendRequest, respondToFriendRequest } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";


const router = Router();

// User registration with avatar & cover image
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

// Login route
router.route("/login").post(loginUser);

// Logged-in user's own profile (protected)
router.route("/profile").get(verifyAccessToken, getUserProfile);

router.route("/friend-request").post(verifyAccessToken, sendFriendRequest);
router.route("/respond-friend-request").post(verifyAccessToken, respondToFriendRequest);

// Public profile by user ID (open)
router.route("/:id").get(getUserById);





export default router;



