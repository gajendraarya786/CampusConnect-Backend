import { Router } from "express";

import { createProject, getProjects, joinProject, getUserProjects, getProjectRecommendations, deleteProject, updateProject } from "../controllers/project.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/").post(verifyAccessToken, createProject);
router.route("/").get(getProjects);
router.route("/:projectId/join").post(verifyAccessToken, joinProject);
router.route("/recommendations/project").get(verifyAccessToken, getProjectRecommendations);
router.route("/:id").put(verifyAccessToken, updateProject);
router.route("/:id").delete(verifyAccessToken, deleteProject);
router.route("/user/me").get(verifyAccessToken, getUserProjects);


export default router;