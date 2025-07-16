import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})
const PORT = process.env.PORT || 8000;

import connectDB from "./db/db.js";
import { app } from "./app.js";
import http from 'http'
import {setupSocket} from './utils/socketSetup.js'


const server = http.createServer(app);
setupSocket(server);


connectDB()
.then(() => {
    server.listen(PORT || 8000, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err) => {
    console.log("Mongodb connection failed",err);
})