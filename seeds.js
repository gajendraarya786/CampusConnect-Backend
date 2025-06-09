import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Club } from './src/models/club.models.js'
import clubData from './src/data/clubData.js'
import connectDB from './src/db/db.js'

dotenv.config();
await connectDB();

try{
    await Club.deleteMany();
    await Club.insertMany(clubData);
    console.log("Data saved successfully");
    process.exit();
}catch (err) {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
}