import { Router } from "express";
import { loginUser, 
         registerUser, 
         getUserProfile, 
         getUserById, 
         updateProfile,
         sendFriendRequest, 
         respondToFriendRequest, 
         getAllUsers,
         getChatHistory, 
         searchUsers,
         deleteChat
        }
        from "../controllers/user.controller.js";
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
router.route("/profile").patch(
  verifyAccessToken,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateProfile 
);
router.route("/all").get(verifyAccessToken, getAllUsers);

//search users
router.route("/").get(verifyAccessToken, searchUsers)

router.route("/friend-request").post(verifyAccessToken, sendFriendRequest);
router.route("/respond-friend-request").post(verifyAccessToken, respondToFriendRequest);

//Chat route
router.route("/chat-history").get(verifyAccessToken, getChatHistory);
router.route("/chat-history/:otherUserId").delete(verifyAccessToken, deleteChat);

// Public profile by user ID (open)
router.route("/:id").get(getUserById);

export default router;



