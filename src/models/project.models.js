import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['hackathon', 'academic', 'research', 'startup', 'competition', 'other'],
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  teamSize: {
    min: { type: Number, default: 1 },
    max: { type: Number, required: true }
  },
  currentMembers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  deadline: Date,
  technologies: [String],
  githubLink: String,
  requirements: String,
  location: {
    type: String,
    enum: ['on-campus', 'remote', 'hybrid'],
    default: 'on-campus'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

export {Project};