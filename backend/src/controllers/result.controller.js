import Result from "../models/Result.js";

export const submitResult = async (req, res) => {
  const { score, weakTopics } = req.body;

  const result = await Result.create({
    userId: req.user.id,
    score,
    weakTopics,
  });

  res.json(result);
};