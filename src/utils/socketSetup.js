import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

function setupSocket(server) {
     const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }
     });
     
     io.on('connection', (socket) => {
        socket.on('joinRoom', ({userId, otherUserId}) => {
            console.log('joinRoom:', { userId, otherUserId });
            const room = [userId, otherUserId].sort().join('_');
            socket.join(room);
        });
        
        socket.on('sendMessage', async({from, to, content}) => {
            console.log('sendMessage:', { from, to, content });
            const room = [from, to].sort().join('_');
            const message = await Message.create({from, to, content});
            io.to(room).emit('receiveMessage', message);
        });
     });

     return io;
}

export {setupSocket}