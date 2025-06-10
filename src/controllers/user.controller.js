import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from '../models/user.models.js';
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
    .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
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

export {
  registerUser,
  loginUser,
  getUserProfile, // ✅ Add this
  getUserById
};
