import { Roommate } from "../models/roommateProfile.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";

const saveRoommateProfile = async(req, res) => {
    try{
        const userId = req.user._id;
        const {
          gender,
          email,
          phone,
          course,
          currentLocation,
          preferredLocation,
          preferredGender,
          prefferedAccomodationType,
          preferredRoomType,
          budget,
          sleepSchedule,
          cleanliness,
          diet,
          smoking,
          alcohol,
          personalityType,
          hobbies,
          talkativeness,
          noiseTolerance,
          socialWithRoommate,
          socialLinks,
          additionalNotes
         } = req.body;

        const profile = await Roommate.findOne({
            user: userId,
        })

        if(profile){
           profile.gender = gender;
           profile.email = email;
           profile.phone = phone;
           profile.course = course;
           profile.currentLocation = currentLocation;
           profile.preferredLocation = preferredLocation;
           profile.preferredGender = preferredGender;
           profile.prefferedAccomodationType = prefferedAccomodationType;
           profile.preferredRoomType = preferredRoomType;
           profile.budget = budget;
           profile.sleepSchedule = sleepSchedule;
           profile.cleanliness = cleanliness;
           profile.diet = diet;
           profile.smoking = smoking;
           profile.alcohol = alcohol;
           profile.personalityType = personalityType;
           profile.hobbies = hobbies;
           profile.talkativeness = talkativeness;
           profile.noiseTolerance = noiseTolerance;
           profile.socialWithRoommate = socialWithRoommate;
           profile.socialLinks = socialLinks;
           profile.additionalNotes = additionalNotes;

           await profile.save();
           return res.status(200)
           .json(new ApiResponse(200, profile, "Profile updated successfully"));
        } 
        else{
            profile = new Roommate({
                user: userId,
                gender,
                email,
                phone,
                course,
                currentLocation,
                preferredLocation,
                preferredGender,
                prefferedAccomodationType,
                preferredRoomType,
                budget,
                sleepSchedule,
                cleanliness,
                diet,
                smoking,
                alcohol,
                personalityType,
                hobbies,
                talkativeness,
                noiseTolerance,
                socialWithRoommate,
                socialLinks,
                additionalNotes
            });

            await profile.save();
            return res.status(200)
            .json(new ApiResponse(200, profile, "Profile created successfully"));
        }

    }catch(err){
         throw new ApiError(404, 'Something went wrong', err); 
    }
};

const getMyRoommateProfile = async(req, res) => {
    try{
       const userId = req.user._id;
       const profile = await Roommate.findOne({user: userId});
       if(!profile){
        throw new ApiError(404, 'Failed to fetch Roommate Profile');
       }

    }catch(err){
        res.status(404, "Some error occured while fetching profile", err);
    }
};

const getAllRoommateProfile = async(req, res) => {
    try{
       const profiles = await Roommate.find().populate('user', 'fullname email');
       res.status(200)
       .json(new ApiResponse(200, profiles, "Roommate profiles fetched successfully"));
    }catch(err){
      throw new ApiError(500, "Error occured", err);
    }
};

const getRoommateProfileById = async(req, res) => {
     try {
        const { id } = req.params;
        const profile = await Roommate.findById(id);
        if(!profile){
            throw new ApiError(404, "Profile not found");
        }
        else{
            res.status(200)
            .json(new ApiResponse(200, profile, "Profile found successfully"));
        }
     } catch (err) {
      throw new ApiError(500, "Error occured ", err);
     }
};

const deleteMyRoommateProfile = async(req, res) => {
    try{
       const userId = req.user._id;
       const deleted = await Roommate.findOneAndDelete({user: userId});
       if(!deleted){
         throw new ApiError(404, "Profile not found");
       }
       return res.status(200)
       .json(new ApiResponse(200, "Profile deleted successfully"));
    }catch(err){
        throw new ApiError(500, "Error occured ", err);
    }
}