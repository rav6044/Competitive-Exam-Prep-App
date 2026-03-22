// backend/src/config/constants.js
import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_only_for_dev";
export const EXAM_DURATION = 1800; // seconds