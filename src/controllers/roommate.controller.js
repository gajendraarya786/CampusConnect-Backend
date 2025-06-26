import { Roommate } from "../models/roommateProfile.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
           const newProfile = new Roommate({
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

            await newProfile.save();
            return res.status(200)
            .json(new ApiResponse(200, newProfile, "Profile created successfully"));
        }

    }catch(err){
    console.error('Roommate profile save error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message, stack: err.stack });
   } 

};

const getMyRoommateProfile = async(req, res) => {
    try{
       const userId = req.user._id;
       const profile = await Roommate.findOne({user: userId});
       if(!profile){
        throw new ApiError(404, 'Failed to fetch Roommate Profile');
       }
       res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));

    }catch(err){
        res.status(404).json({message: "Some error occured while fetching the profile", err});
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
        const profile = await Roommate.findById(id).populate('user', 'fullname email');
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
};
const getRoommateMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const myProfile = await Roommate.findOne({ user: userId });
    if (!myProfile) {
      throw new ApiError(400, "Create your roommate profile first");
    }

    // Only exclude self and (optionally) filter by gender
    const hardFilters = {
      user: { $ne: userId },
      gender: myProfile.preferredGender
    };
    // If user has a strong gender preference, add it
     if (
      myProfile.preferredGender &&
      myProfile.preferredGender.toLowerCase() !== 'any'
    ) {
      hardFilters.gender = myProfile.preferredGender.toLowerCase();
    }

    let candidates = await Roommate.find(hardFilters).populate('user', 'fullname email');
    console.log('Candidates:', candidates);

    // Score each candidate based on soft filters
    const scoredCandidates = candidates.map(candidate => {
      let score = 0;

      // Soft filters: add points for each match
      if (candidate.preferredRoomType === myProfile.preferredRoomType) score += 2;
      if (candidate.prefferedAccomodationType === myProfile.prefferedAccomodationType) score += 2;
      if (candidate.sleepSchedule === myProfile.sleepSchedule) score += 2;
      if (candidate.cleanliness === myProfile.cleanliness) score += 2;
      if (candidate.diet === myProfile.diet) score += 1;
      if (candidate.smoking === myProfile.smoking) score += 1;
      if (candidate.alcohol === myProfile.alcohol) score += 1;
      if (candidate.personalityType === myProfile.personalityType) score += 1;
      if (candidate.talkativeness === myProfile.talkativeness) score += 1;
      if (candidate.noiseTolerance === myProfile.noiseTolerance) score += 1;
      if (candidate.socialWithRoommate === myProfile.socialWithRoommate) score += 1;

      // Hobbies overlap (soft match)
      if (myProfile.hobbies && candidate.hobbies) {
        const myHobbies = Array.isArray(myProfile.hobbies) ? myProfile.hobbies : [myProfile.hobbies];
        const candidateHobbies = Array.isArray(candidate.hobbies) ? candidate.hobbies : [candidate.hobbies];
        const commonHobbies = myHobbies.filter(hobby => candidateHobbies.includes(hobby));
        score += commonHobbies.length; // 1 point per common hobby
      }

      // Deal breakers: if any of my dealBreakers are present in candidate, set score to -1000 (exclude)
      if (myProfile.dealBreakers && candidate.dealBreakers) {
        const hasDealBreaker = myProfile.dealBreakers.some(db => candidate.dealBreakers.includes(db));
        if (hasDealBreaker) score = -1000;
      }

      return { candidate, score };
    });

    // Filter out candidates with negative score
    const filtered = scoredCandidates.filter(item => item.score >= 0);

    // Sort by score descending
    filtered.sort((a, b) => b.score - a.score);

    // Return only the candidate profiles, with score
    const matches = filtered.map(item => ({
      profile: item.candidate,
      matchScore: item.score
    }));

    res.json(matches);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
    saveRoommateProfile,
    getMyRoommateProfile,
    getAllRoommateProfile,
    getRoommateProfileById,
    deleteMyRoommateProfile,
    getRoommateMatches
}