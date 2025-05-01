import { Server } from "socket.io";
import messages from "../models/message.js"; 
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'https://landslidedisasterriskmanagmentfrontend.onrender.com',
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    // Handle Alerts
    socket.on("sendAlert", (data) => {
      try {
        console.log("New alert received:", data);
        io.emit("newAlert", data);
      } catch (error) {
        console.error("Error while processing alert:", error);
      }
    });

    // Handle joining chat rooms
    socket.on("joinRoom", ({ room }) => {
      console.log(`User ${socket.id} joined the room: ${room}`);
      socket.join(room);
    });

    // Handle sending messages
    socket.on("sendMessage", (data) => {
      try {
        const { room } = data;
        io.to(room).emit("receiveMessage", data);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

export const getSocket = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
