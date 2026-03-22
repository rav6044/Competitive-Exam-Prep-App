/**
 * Refined Adaptive Logic
 * 1. Looks for the immediate next unanswered question first (to maintain flow).
 * 2. If the user is at the end, it circles back to find weak topics they missed.
 */
export const getNextQuestion = (questions, weakTopics, answers, currentIndex) => {
  const weakSet = new Set(
    weakTopics
      .filter((t) => t.accuracy < 50)
      .map((t) => t.topic)
  );

  // 1. Get all questions that haven't been answered yet
  const unanswered = questions.filter((q) => !answers[q._id]);

  if (unanswered.length === 0) return null;

  // 2. Prioritize the immediate next question in the array if it's unanswered
  // This prevents jumping from 1 to 3 if 2 is still available
  const immediateNext = questions[currentIndex + 1];
  if (immediateNext && !answers[immediateNext._id]) {
    return immediateNext;
  }

  // 3. If the immediate next is already answered, look for the 
  // first unanswered question that matches a weak topic (Forward Search)
  const forwardWeak = questions
    .slice(currentIndex + 1)
    .find((q) => !answers[q._id] && weakSet.has(q.topic));

  if (forwardWeak) return forwardWeak;

  // 4. Fallback: Just give the very next available unanswered question
  const nextAvailable = questions
    .slice(currentIndex + 1)
    .find((q) => !answers[q._id]);

  if (nextAvailable) return nextAvailable;

  // 5. Absolute Fallback: If nothing forward, return the first unanswered question from the start
  return unanswered[0];
};