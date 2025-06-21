// controllers/projectController.js
import { Project } from '../models/project.models.js';
import { User } from '../models/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Create a new project
 const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      teamSize,
      technologies,
      deadline,
      location,
      requirements,
      githubLink
    } = req.body;

    const project = await Project.create({
      title,
      description,
      category,
      skills,
      teamSize,
      technologies,
      deadline,
      location,
      requirements,
      githubLink,
      owner: req.user._id,
      currentMembers: [{ user: req.user._id, role: 'owner' }]
    });

    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: { project: project._id, role: 'owner' } }
    });

    res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// Get all projects (with filters)
 const getProjects = async (req, res) => {
  try {
    const { category, skills, status, location } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }

    const projects = await Project.find(filter)
      .populate('owner', 'fullname username avatar')
      .populate('currentMembers.user', 'fullname username avatar')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, projects, 'Projects fetched successfully'));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// Join a project
 const joinProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (project.status !== 'open') {
      throw new ApiError(400, 'Project is not open for joining');
    }

    if (project.currentMembers.length >= project.teamSize.max) {
      throw new ApiError(400, 'Project team is full');
    }

    const alreadyMember = project.currentMembers.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      throw new ApiError(400, 'Already a member of this project');
    }

    project.currentMembers.push({ user: req.user._id, role: 'member' });
    await project.save();

    // Add project to user's projects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { projects: { project: projectId, role: 'member' } }
    });

    res.json(new ApiResponse(200, project, 'Joined project successfully'));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

// Get project recommendations
 const getProjectRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userSkills = user.skills || [];
    const userInterests = user.interests || [];

    const recommendations = await Project.find({
      status: 'open',
      skills: { $in: userSkills },
      currentMembers: { $not: { $elemMatch: { user: req.user._id } } }
    })
    .populate('owner', 'fullname username avatar')
    .limit(10)
    .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, recommendations, 'Recommendations fetched'));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.owner.toString() !== userId.toString()) throw new ApiError(403, "Only the owner can delete");
  await Project.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"));
};

const updateProject = async (req, res) => {
    const {id} = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if(!project){
        throw new ApiError(404, "Project not found");
    }
    if(String(project.owner) !== String(userId)){
        throw new ApiError(404, "Only Owner can update");
    }
    const updated = await Project.findByIdAndUpdate(id, req.body, {new: true});

   return res.status(200).json(new ApiResponse(200, updated, "Project updated successfully"));
};

const getUserProjects = async(req, res) => {
    const projects = await Project.find({owner: req.user._id});
    res.status(200).json({ success: true, data: projects });
}

export{
    createProject,
    getProjects,
    joinProject,
    getProjectRecommendations,
    getUserProjects,
    deleteProject,
    updateProject
}