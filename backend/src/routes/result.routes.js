import express from "express";
import { submitResult } from "../controllers/result.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitResult);

export default router;