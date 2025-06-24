import mongoose, { mongo } from "mongoose";

const RoommateProfileSchema = new mongoose.Schema({
    user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User"
    },
    gender: {
       type: String,
       enum: ['male', 'female', 'other'],
       required: true,
    },
     email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
   },
    phone: {
      type: String,
      default: '',
      required: true
  },
    course: {
      type: String,
      required: true,
  },
    currentLocation: {
    type: String,
    enum:['InCampus', 'OffCampus'],
     required: true,
  },
    preferredLocation: {
    type: String,
    enum:['InCampus', 'OffCampus'],
    required: true,
  },
   preferredGender: {
    type: String,
    enum: ['Male', 'Female', 'Any'],
    default: 'Any',
    required: true,
  },
  prefferedAccomodationType: {
     type: String,
     enum: ['Hostel', 'Pg', 'Flat'],
  },
  preferredRoomType: {
     type: String,
     enum: ['Double Sharing', 'Triple Sharing'],
     required: true,
  },
  budget: {
    min: Number,
    max: Number,
    required: true,
  },
  sleepSchedule: {
    type: String,
    enum: ['Early Bird', 'Night Owl', 'Flexible'],
    required: true,
  },
  cleanliness: {
    type: String,
    enum: ['Messy', 'Average', 'Very Tidy'],
    required: true,
  },
  diet: {
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Any'],
  },
  smoking: {
    type: String,
    enum: ['Yes', 'No', 'Occasionally'],
  },
  alcohol: {
    type: String,
    enum: ['Yes', 'No', 'Occasionally'],
  },
  personalityType: {
    type: String,
    enum: ['Introvert', 'Extrovert', 'Ambivert'],
  },
  hobbies: {
    type: String,
  },
  talkativeness: {
    type: String,
    enum: ['Talkative', 'Quiet', 'In-between'],
  },
  noiseTolerance: { 
    type: String, enum: ['Low', 'Medium', 'High'] 
  },
  socialWithRoommate: {
    type: Boolean, // true if they want to hang out with roommate
  },
  socialLinks: {
  linkedin: String,
  instagram: String,
  },
  additionalNotes: {
    type: String,
  },
 
}, {timestamps: true});

const Roommate = mongoose.model('Roommate', RoommateProfileSchema);

export {Roommate}