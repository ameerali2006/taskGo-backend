import { Socket, Server } from "socket.io";
import { SocketEvents } from "./socket.events";

export const registerSocketHandlers = (_io: Server, socket: Socket): void => {
  // Handle user joining their private room
  socket.on(SocketEvents.JOIN_USER, (userId: string) => {
    if (userId) {
      socket.join(userId);
      console.log(`⚡ Socket ${socket.id} joined room: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
};
