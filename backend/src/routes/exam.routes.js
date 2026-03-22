import express from "express";
import { getExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.get("/", getExam);
router.get("/start", getExam);
export default router;