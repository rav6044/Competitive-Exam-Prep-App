import Exam from "../models/Exam.js";

export const getExam = async (req, res) => {
  try {
    const exam = await Exam.findOne();

    if (!exam) {
      return res.status(404).json({
        msg: "No exam found",
      });
    }

    res.json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};