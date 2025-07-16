import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from '../models/user.models.js';
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Token generation helper
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

// User registration
const registerUser = async (req, res, next) => {
  const {
    fullname, email, username, password, branch,
    year, gender, dob, mobile, linkedIn, github, leetcode, bio, skills
  } = req.body;

  if (!fullname || !email || !username || !password || !branch || !year || !gender || !dob || !mobile) {
    throw new ApiError(400, "Required fields are missing");
  }

  let parsedDOB;
  try {
    const [day, month, year] = dob.split('/');
    parsedDOB = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsedDOB.getTime())) {
      throw new Error("Invalid DOB");
    }
  } catch (err) {
    throw new ApiError(400, "DOB format should be DD/MM/YYYY");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
 
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  const user = await User.create({
    fullname,
    email,
    branch,
    year,
    gender,
    dob: parsedDOB,
    mobile,
    linkedIn,
    github,
    leetcode,
    bio,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    skills: Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills.split(",")
        : [],
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
};

// User login
const loginUser = async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  }).select('+password');

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.password) {
    throw new ApiError(400, "User has no password set.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
    );
};

// ✅ Get logged-in user's own profile
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(200, user, "User profile fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // or however you get the logged-in user
    const updateData = { ...req.body };

    // Handle avatar upload
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const avatarUpload = await uploadOnCloudinary(req.files.avatar[0].path, {
        folder: 'avatars'
      });
      updateData.avatar = avatarUpload.secure_url;
    }

    // Handle cover image upload
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const coverUpload = await uploadOnCloudinary(req.files.coverImage[0].path, {
        folder: 'covers'
      });
      updateData.coverImage = coverUpload.secure_url;
    }

    // If skills is a string, convert to array
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json({ data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};


// Public profile by user ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(200, user, "Public user profile fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

const sendFriendRequest = async(req, res) => {

    const {toUserId} = req.body;
    const {fromUserId} = req.user._id;

    if(String(toUserId) === String(fromUserId)){
      throw new ApiError(401, "You can't send request to yourself")
    }

    //Check if already friends or request exists
    const toUser = await User.findById(toUserId);
    if(!toUser){
      throw new ApiError(404, 'User not found');
    }

    const alreadyRequested = toUser.friendRequests.some(
    req => String(req.from) === String(fromUserId) && req.status === 'pending'
    );
   if (alreadyRequested) return res.status(400).json({ message: "Request already sent." });
   
   toUser.friendRequests.push({from: fromUserId});
   await toUser.save();

   return res.status(200)
   .json(new ApiResponse(200, 'Friend request sent'))
};

const respondToFriendRequest = async(req, res) => {
    const {fromUserId, action} = req.body;
    const toUserId = req.user._id;

    const user =  await User.findById(toUserId);
    const request = user.friendRequests.find(
      req => req.from.toString() === fromUserId && req.status === 'pending'
    );

    if(!request){
      throw new ApiError(404, "Request not found");
    }
    request.status = action === 'accept' ? 'accepted' : 'declined';
    
    if(action == 'accept'){
      user.friends.push(fromUserId);
      const fromUser = await User.findById(fromUserId);
      fromUser.friends.push(toUserId);
      await fromUser.save();
    }
    await user.save();

    res.status(200)
    .json(new ApiResponse(200, `Request ${action}ed`))
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id fullname username avatar"); // select only needed fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getChatHistory = async(req, res) => {
    try {
       const {userId, otherUserId} = req.query;
       if(!userId || !otherUserId){
          throw new ApiError(400, "userId and otherUserId are required");
       }
       const messages = await Message.find({
        $or: [
          {from: userId, to: otherUserId},
          {from: otherUserId, to: userId}
        ]
       }).sort({timestamp: 1});
       res.json(messages)
    } catch (err) {
       throw new ApiError(500, "Failed to fetch chat history", err);
    }
};

const deleteChat = async(req, res, next) => {
   try {
     const userId= req.user._id;
     const {otherUserId} = req.params;

     if(!otherUserId){
       throw new ApiError(404, "otherUserId is required");
     }
     await Message.deleteMany({
      $or: [
          {from: userId, to:otherUserId},
          {from: otherUserId, to: userId}
      ]
     });
     res.status(200).json(new ApiResponse(200, "Chat deleted successfully"));
   } catch (err) {
     throw new ApiError(404, "Failed to delete chat", err);
   }
}

const searchUsers = async (req, res) => {
  // Accept both ?q= and ?search= for flexibility
  const q = req.query.q || req.query.search || '';
  if (!q) return res.json([]);
  const users = await User.find({
    $or: [
      { fullname: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } }
    ]
  }, "_id fullname username avatar email");
  res.json({ data: users });
};
export {
  registerUser,
  loginUser,
  getUserProfile, 
  updateProfile,
  getUserById,
  sendFriendRequest,
  respondToFriendRequest,
  getAllUsers,
  searchUsers,
  getChatHistory,
  deleteChat
};
