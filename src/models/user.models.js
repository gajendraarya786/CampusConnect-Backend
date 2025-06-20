import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        //make index true for efficient searching in the db
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[a-zA-Z]+\.[0-9]{6}@stu\.upes\.ac\.in$/, "Enter your UPES provided email only"],
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    branch: {
        type: String,
        required: true,
    },
    year:{
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other'],
    },
    dob: {
       type: Date,
       required: true,

    },
    mobile:{
       type: String,
       required: true
    },
    linkedIn: {
        type: String,
    },
    github: {
        type: String,
    },
    leetcode: {
        type: String,
    },
    bio: {
       type: String,
    },
    skills: {
        type: [String],
        validate: [arr => arr.length <= 10, 'Max 10 skills allowed']
    },
    avatar: {
        type: String, //cloudinary url 
        default: "https://yourcdn.com/default-avatar.png",
    },
    coverImage: {
        type: String,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        from:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
        status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'}
    }],
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
    refreshToken: {
        type: String,
    }
       
    
},{timestamps: true})

//using pre middleware to do something before storing in the database
//async function bcuz it takes time to encypt passwords and dont use arrow callback function as refernce of 'this' is required
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
    //here 10 is rounds that it takes to encrypt pass
     this.password = await bcrypt.hash(this.password, 10);
     next()
    }
    else{
        return next()
    }
})

//checking if the password entered by the user is correct or not by defining custom method
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password); 
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
   )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
    {
        //we only keep id in this 
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
   )
}
const User = mongoose.model("User", userSchema);

export {User};
