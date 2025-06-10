import mongoose, { mongo } from "mongoose";
import { User } from "./user.models";

const postSchema = new mongoose.Schema({
    title: {
       type: String,
       required: true,
       maxLength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    images: [{
        url: String,
        alt: String,
        caption: String,
    }],
    videos: [{
        url: String,
        thumbnail: String,
        duration: Number
    }],
    tags: [{
    type: String,
    lowercase: true,
    trim: true
    }],
    category: {
        type: String,
        enum: ['general', 'technology', 'lifestyle', 'education', 'entertainment', 'other'],
        default: 'general'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'friends', 'draft'],
        default: 'public'
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxLength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
            },
            likedAt: {
                type: Date,
                default: Date.now
            }
        }],
        likesCount: {
            type: Number,
            default: 0
        }
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    shares: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        },
        platform: String
    }],
    sharesCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted', 'flagged', 'pending'],
        default: 'active'
    },
    isEdited: {
        type: Boolean,
        required: false
    },
    editHistory: [{
       editedAt: Date,
       previousContent: String,
       reason: String,
    }],
    slug: {
    type: String,
    unique: true,
    sparse: true 
  },
  
  excerpt: {
    type: String,
    maxlength: 300
  },
  

  views: {
    type: Number,
    default: 0
  },
  
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    duration: Number,
  }],
  
  // Location (if applicable)
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  scheduledAt: Date,
  

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
  
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

export {Post}