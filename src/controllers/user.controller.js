//import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.models.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => {
    try {
       const user =  await User.findById(userId);
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       
       user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});
       
       return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation refresh and access token")
    }

}



//we can write controllers without using asyncHandler like below using try catch
const registerUser = async (req, res, next) => {
    //get user details from frontend
    //validation - not empty
    //Validating dateOfBirth
    //check if user already exists: by username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    // create user object - create entry in db 
    //remove password and refresh token field from response
    //check for user creation
    //return response
    

    //Step-1 Getting details from frontend
    const {fullname, email, username, password, branch, year, gender, dob, mobile, linkedIn, github, leetcode, bio, skills} = req.body;
    console.log("email:" , email);
    console.log("password:", password);

    
    //Validating
  if(!fullname || !email || !username || !password || !branch || !year || !gender || !dob || !mobile){
    throw new ApiError(400, "Required fields are missing");
  }

  //Validating DOB
  let parsedDOB;
try {
  const [day, month, year] = dob.split('/');
  parsedDOB = new Date(`${year}-${month}-${day}`); // Converts to YYYY-MM-DD
  if (isNaN(parsedDOB.getTime())) {
    throw new Error("Invalid DOB");
  }
} catch (err) {
  throw new ApiError(400, "DOB format should be DD/MM/YYYY");
}

   //Checking if user already exists 
   const existedUser =  await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists");
    }
     
     console.log("Received files:", req.files);
    console.log("Received body:", req.body);

    //checking for files (multer gives access to req.fils method)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
        
    }

    //Uploading on cloudinary 
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath?  await uploadOnCloudinary(coverImageLocalPath) : null;
     
    if(!avatar?.url){
        throw new ApiError(400, "Failed to upload on Cloudinary");
    }
    
    //creating a user
    const user = await User.create({
        fullname: fullname,
        email: email,
        branch: branch,
        year: year,
        gender: gender,
        dob: parsedDOB,
        mobile: mobile,
        linkedIn: linkedIn,
        github: github,
        leetcode: leetcode,
        bio: bio,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",")
        : [],
        password: password,
        username: username.toLowerCase()
    })
    

    //checking if a user is created  
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    else{
       return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
       )
    }
}


// const registerUser = asyncHandler( async (req, res) => {
//         res.status(200).json({
//         message: "ok"
//     })
// })

const loginUser = async (req, res, next) =>{
       //req body
       //username or email
       //find the user
       //password check
       //access and refresh token 
       //send cookies
       
       const {email, username, password} = req.body;
       
       if(!username || !email) {
        throw new ApiError(400, "username or email is required");
       }
       
      const user = await User.findOne({
        $or: [{username}, {email}]
       })

       if(!user) {
        throw new ApiError(404, "User does not exist");
       }
       
       const isPasswordValid = await user.isPasswordCorrect(password);

       if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
       }
      
       const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
        
       const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
       
       //sending cookies
       const options = {
        httpOnly: true,
        secure: true
       }

       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully")
       )
} 

export {registerUser, loginUser};