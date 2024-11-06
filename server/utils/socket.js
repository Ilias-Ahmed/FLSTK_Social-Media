import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

let io;
const userSockets = new Map(); // Track user socket connections

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      if (!socket.handshake.query?.token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.userName}`);

    // Add user to active users map
    userSockets.set(socket.user._id.toString(), socket.id);

    // Join personal room
    socket.join(socket.user._id.toString());

    // Handle typing status
    socket.on("typing", ({ conversationId, receiverId, isTyping }) => {
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          conversationId,
          userId: socket.user._id,
          isTyping,
        });
      }
    });

    // Handle read receipts
    socket.on(
      "messageRead",
      async ({ messageId, conversationId, senderId }) => {
        const senderSocketId = userSockets.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageReadUpdate", {
            messageId,
            conversationId,
            readAt: new Date(),
          });
        }
      }
    );

    // Handle user online status
    socket.on("getOnlineStatus", ({ userIds }) => {
      const onlineStatus = userIds.reduce((acc, userId) => {
        acc[userId] = userSockets.has(userId);
        return acc;
      }, {});
      socket.emit("onlineStatusResponse", onlineStatus);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.userName}`);
      userSockets.delete(socket.user._id.toString());
      io.emit("userOffline", { userId: socket.user._id });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
};
