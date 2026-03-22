import mongoose from "mongoose";
import dotenv from "dotenv";
import Exam from "../models/Exam.js";

dotenv.config();

const seedExam = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // ❗ Clear old data
    await Exam.deleteMany();

    // ✅ Insert new exam
    const exam = await Exam.create({
      title: "Full Mock Test",
      questions: [
        { text: "2 + 2?", options: ["2", "4"], correctAnswer: "4", topic: "Math" },
        { text: "5 + 3?", options: ["6", "8"], correctAnswer: "8", topic: "Math" },
        { text: "HTML stands for?", options: ["Hyper Text Markup Language", "Hot Mail"], correctAnswer: "Hyper Text Markup Language", topic: "Web" },
        { text: "CSS is used for?", options: ["Styling", "Logic"], correctAnswer: "Styling", topic: "Web" },
        { text: "JS is?", options: ["Programming", "Database"], correctAnswer: "Programming", topic: "JS" },
        { text: "React is?", options: ["Library", "Framework"], correctAnswer: "Library", topic: "React" },
        { text: "Node.js is?", options: ["Runtime", "Browser"], correctAnswer: "Runtime", topic: "Backend" },
        { text: "MongoDB is?", options: ["Database", "Language"], correctAnswer: "Database", topic: "DB" },
        { text: "API stands for?", options: ["Application Programming Interface", "App Data"], correctAnswer: "Application Programming Interface", topic: "Backend" },
        { text: "HTTP 200?", options: ["OK", "Error"], correctAnswer: "OK", topic: "Web" }
      ],
    });

    console.log("🔥 Exam Created:", exam._id);

    process.exit();

  } catch (err) {
    console.error("❌ Seeder Error:", err);
    process.exit(1);
  }
};

seedExam();