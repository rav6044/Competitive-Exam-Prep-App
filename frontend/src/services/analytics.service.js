export const analyzePerformance = (questions, answers) => {
  const topicStats = {};

  questions.forEach((q) => {
    if (!q.topic) return; // safety

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, total: 0 };
    }

    topicStats[q.topic].total++;

    if (answers[q._id] === q.correctAnswer) {
      topicStats[q.topic].correct++;
    }
  });

  return Object.keys(topicStats).map((topic) => {
    const { correct, total } = topicStats[topic];

    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return {
      topic,
      accuracy,
    };
  });
};