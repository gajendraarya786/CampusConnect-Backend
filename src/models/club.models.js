import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
      name: {
         type: String,
         required: true,
       },
       description: {
         type: String,
       },
       imageUrl: {
           type: String,
       },
       category: {
          type: String,
       },
       instagram: {
           type: String,
       }

});

const Club = mongoose.model("Club", clubSchema);
export {Club};
