import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import connectDB from "./config/db";
import { socketServer } from "./config/container";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
socketServer.init(server);

connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});