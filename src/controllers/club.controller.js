import { Club } from "../models/club.models.js";
import { ApiError } from "../utils/ApiError.js";




const getClubs = async(req, res, next) => {
    try{
        const clubs =  await Club.find();
        res.status(200).json(clubs);
    }catch(error){
        throw new ApiError(500, "Failed to fetch clubs");
    } 
}
export {getClubs}