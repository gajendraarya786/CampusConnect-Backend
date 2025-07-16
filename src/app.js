import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express()


const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-connect-dun-alpha.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
//to set limit for incoming data files in json format
app.use(express.json({limit: "16kb"}));

//to encode the data in url
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());



//routes
import userRouter from './routes/user.routes.js'
import clubRouter from './routes/club.routes.js'
import postRouter from './routes/post.routes.js'
import projectRouter from './routes/project.routes.js'
import roommateRouter from './routes/roommate.routes.js'


//routes declaration //middleware
app.use("/api/v1/users", userRouter);
app.use("/api/v1/clubs", clubRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/roommates", roommateRouter);



// http://localhost:8000/api/v1/users/register
export {app}