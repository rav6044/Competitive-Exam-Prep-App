export const calculateRemainingTime = (startTime) => {
  const TOTAL_TIME = 1800; // 30 minutes

  const now = new Date();
  const start = new Date(startTime);

  const elapsed = Math.floor((now - start) / 1000);

  const remaining = TOTAL_TIME - elapsed;

  return remaining > 0 ? remaining : 0; // ✅ NEVER NEGATIVE
};