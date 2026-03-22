import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctAnswer: String,
  topic: String,
});

const examSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema],
});

export default mongoose.model("Exam", examSchema);