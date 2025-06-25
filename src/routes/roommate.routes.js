import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { getMyRoommateProfile, 
         saveRoommateProfile, 
         getAllRoommateProfile, 
         getRoommateProfileById,
         getRoommateMatches,
        deleteMyRoommateProfile } from "../controllers/roommate.controller.js";

const router = Router();
router.get('/', verifyAccessToken, getAllRoommateProfile); // get all profiles
router.post('/profile', verifyAccessToken, saveRoommateProfile); // create/update
router.get('/profile', verifyAccessToken, getMyRoommateProfile); // get my profile
router.get('/matches', verifyAccessToken, getRoommateMatches); // get matches
router.get('/:id', verifyAccessToken, getRoommateProfileById); // get by id
router.delete('/profile', verifyAccessToken, deleteMyRoommateProfile); // delete my profile

export default router;