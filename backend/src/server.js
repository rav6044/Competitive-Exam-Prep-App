import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";
import { setupSocket } from "./sockets/exam.socket.js";

dotenv.config();

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  'https://competitive-exam-prep-app.vercel.app',
  'https://competitive-exam-prep-app-git-main-rav6044s-projects.vercel.app',
  'http://localhost:5173'
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
});

setupSocket(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});