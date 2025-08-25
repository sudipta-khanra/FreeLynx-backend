// server/realtime/socket.js
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://freelynx.vercel.app"],
      credentials: true,
    },
  });

  // store mapping of userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // register user
    socket.on("user:online", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
    });

    // start or join conversation
    socket.on("conversation:start", ({ receiverId }, callback) => {
      const conversationId = `conv-${[socket.userId, receiverId].sort().join("-")}`;
      socket.join(conversationId);

      // if receiver is online, make them join the room
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).socketsJoin(conversationId);
      }

      callback({ conversation: { _id: conversationId }, messages: [] });
    });

    // send message
    socket.on("message:send", ({ conversationId, body }) => {
      const message = { _id: Date.now().toString(), sender: socket.userId, body };
      // broadcast to everyone in the room
      io.to(conversationId).emit("message:new", { message });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (socket.userId) onlineUsers.delete(socket.userId);
    });
  });
};
