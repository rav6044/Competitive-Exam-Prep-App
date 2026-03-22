import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  examId: mongoose.Schema.Types.ObjectId,
  score: Number,
  weakTopics: Array,
});

export default mongoose.model("Result", resultSchema);