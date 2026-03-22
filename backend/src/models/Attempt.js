import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  examId: mongoose.Schema.Types.ObjectId,
  answers: { type: Map, of: String },
  startTime: Date,
  endTime: Date,
});

export default mongoose.model("Attempt", attemptSchema);