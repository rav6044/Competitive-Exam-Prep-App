import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import examRoutes from "./routes/exam.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import resultRoutes from "./routes/result.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

const allowedOrigins = [
  'https://competitive-exam-prep-app.vercel.app',
  'https://competitive-exam-prep-app-git-main-rav6044s-projects.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/result", resultRoutes);

app.use(errorMiddleware);

export default app;