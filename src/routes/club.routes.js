import { Router } from "express";
import { getClubs } from "../controllers/club.controller.js";

const router = Router();

router.route('/').get(getClubs);

export default router;