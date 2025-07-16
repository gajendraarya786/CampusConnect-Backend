import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

function setupSocket(server) {
     const io = new Server(server, {
        cors: {
            origin: [process.env.CORS_ORIGIN, "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true,
        }
     });
     
     io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('joinRoom', ({userId, otherUserId}) => {
            console.log('joinRoom:', { userId, otherUserId });
            const room = [userId, otherUserId].sort().join('_');
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });
        
        socket.on('sendMessage', async({from, to, content, tempId}) => {
            console.log('sendMessage:', { from, to, content, tempId });
            
            try {
                const room = [from, to].sort().join('_');
                const message = await Message.create({from, to, content});
                
                // Send to sender (confirmation with tempId for replacement)
                socket.emit('receiveMessage', {
                    ...message.toObject(),
                    tempId: tempId // Include tempId for frontend to replace optimistic message
                });
                
                // Send to other users in room (without tempId)
                socket.broadcast.to(room).emit('receiveMessage', message);
                
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('messageError', { error: 'Failed to send message' });
            }
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
     });

     return io;
}

export {setupSocket}