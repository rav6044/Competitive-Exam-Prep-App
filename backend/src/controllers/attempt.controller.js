import Attempt from "../models/Attempt.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import { calculateRemainingTime } from "../services/timer.service.js";
import { generateAnalytics } from "../services/analytics.service.js";

export const saveAttempt = async (req, res) => {
  try {
    const { answers, examId } = req.body;
    let attempt = await Attempt.findOne({ userId: req.user.id });

    if (!attempt) {
      attempt = await Attempt.create({
        userId: req.user.id,
        examId,
        answers,
        startTime: new Date(), 
      });
    } else {
      attempt.answers = answers;
      // ❌ DO NOT overwrite startTime
      await attempt.save();
    }
    res.json({ msg: "Saved" });
  } catch (err) {
    res.status(500).json({ msg: "Error saving attempt" });
  }
};

export const getCurrentAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ userId: req.user.id });
    if (!attempt) {
      return res.json({ answers: {} });
    }
    res.json({
      answers: attempt.answers,
      startTime: attempt.startTime,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching attempt" });
  }
};

// 🔥 SERVER TIMER
export const getRemainingTime = async (req, res) => {
  try {
    const totalTime = 1800; // 30 min
    let attempt = await Attempt.findOne({ userId: req.user.id });

    // 🟢 FIRST TIME → START TIMER
    if (!attempt) {
      attempt = await Attempt.create({
        userId: req.user.id,
        answers: {},
        startTime: new Date(),
      });
      return res.json({ timeLeft: totalTime });
    }

    // 🟡 If expired → RESET (IMPORTANT FIX)
    if (!attempt.startTime) {
      attempt.startTime = new Date();
      await attempt.save();
      return res.json({ timeLeft: totalTime });
    }

    // ✅ Using the imported service here!
    let remaining = calculateRemainingTime(attempt.startTime);

    // 🔴 CRITICAL FIX
    if (remaining <= 0) {
      console.log("⚠️ Timer expired → resetting");
      attempt.startTime = new Date();
      await attempt.save();
      remaining = totalTime;
    }

    console.log("⏱ Remaining:", remaining);
    res.json({ timeLeft: remaining });

  } catch (err) {
    console.error("Timer error:", err);
    res.status(500).json({ msg: "Timer error" });
  }
};

// 🔥 SUBMIT EXAM
export const submitAttempt = async (req, res) => {
  const userId = req.user.id || req.user._id; 
  const { examId, answers } = req.body;

  try {
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    // ✅ Use the imported Analytics Service 
    const { score, weakTopics } = generateAnalytics(exam.questions, answers);

    // ✅ Save the Result to the database using the imported Result model
    const newResult = new Result({
      userId,
      examId,
      score,
      weakTopics
    });
    await newResult.save();

    // Save final Attempt state 
    const attempt = new Attempt({
      examId,
      userId,
      answers,
    });
    await attempt.save();

    // ✅ Return all necessary fields to the frontend
    res.json({
      msg: "Exam submitted successfully",
      score,
      total: exam.questions.length,
      weakTopics 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTime = async (req, res) => {
  try {
    const totalTime = 1800;
    res.json({ timeLeft: totalTime });
  } catch (err) {
    res.status(500).json({ msg: "Timer error" });
  }
};

export const resetAttempt = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(400).json({ msg: "User not found" });
    }

    const deleted = await Attempt.deleteOne({ userId });
    if (!deleted.deletedCount) {
      return res.status(404).json({ msg: "No existing attempt found to reset" });
    }
    return res.json({ msg: "Attempt reset successfully" });
  } catch (err) {
    console.error("Reset attempt error:", err);
    return res.status(500).json({ msg: "Failed to reset attempt" });
  }
};