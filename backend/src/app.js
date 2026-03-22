import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import examRoutes from "./routes/exam.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import resultRoutes from "./routes/result.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/attempt", attemptRoutes);
app.use("/api/result", resultRoutes);

app.use(errorMiddleware);

export default app;