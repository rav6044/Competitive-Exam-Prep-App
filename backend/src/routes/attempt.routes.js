import express from "express";
import {
  saveAttempt,
  getCurrentAttempt,
  getRemainingTime,
  submitAttempt,
  resetAttempt
} from "../controllers/attempt.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/save", authMiddleware, saveAttempt);
router.get("/current", authMiddleware, getCurrentAttempt);
router.get("/time", authMiddleware, getRemainingTime);
router.post("/submit", authMiddleware, submitAttempt);
router.post("/reset", authMiddleware, resetAttempt);

export default router;