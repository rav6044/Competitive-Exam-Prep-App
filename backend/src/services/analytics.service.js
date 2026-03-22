export const generateAnalytics = (questions, answers) => {
  let score = 0;
  const topicMap = {};

  questions.forEach((q) => {
    // Fallback if topic is missing
    const topic = q.topic || "General"; 

    if (!topicMap[topic]) {
      topicMap[topic] = { correct: 0, total: 0 };
    }

    topicMap[topic].total++;

    // Check both potential schema keys to prevent scoring bugs
    const correctAns = q.correctOption || q.correctAnswer;

    if (answers[q._id] === correctAns) {
      score++;
      topicMap[topic].correct++;
    }
  });

  const weakTopics = Object.keys(topicMap).map((topic) => {
    const { correct, total } = topicMap[topic];
    return {
      topic: topic, // ✅ Changed 'name' to 'topic' so frontend doesn't break
      accuracy: (correct / total) * 100,
    };
  });

  return {
    score,
    weakTopics: weakTopics.sort((a, b) => a.accuracy - b.accuracy),
  };
};