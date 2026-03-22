import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAttempt } from "../features/attempt/attemptSlice";
import { setAnalytics } from "../features/analytics/analyticsSlice";
import api from "../utils/axios";

export default function ResultPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { score = 0, total = 0, weakTopics = [] } = useSelector(
    (state) => state.analytics
  );

  const accuracy = total > 0 ? ((score / total) * 100).toFixed(2) : "0";

  const handleReset = async () => {
    try {
      // Clear frontend state
      dispatch(clearAttempt());
      dispatch(setAnalytics({ score: 0, total: 0, weakTopics: [] }));

      // Reset backend attempt
      await api.post("/attempt/reset");

      navigate("/dashboard");
    } catch (err) {
      console.error("Reset failed:", err);
      alert("Failed to reset exam. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">📊 Exam Result</h1>

        {/* Score Card */}
        <div className="bg-gray-50 p-6 rounded-xl shadow mb-6">
          <p className="text-xl mb-2">
            Score: <span className="font-bold text-green-600">{score}</span> / {total}
          </p>
          <p className="text-md mb-4">
            Accuracy: <span className="font-semibold">{accuracy}%</span>
          </p>

          {/* Accuracy bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-green-500 h-6 text-white flex items-center justify-center font-semibold"
              style={{ width: `${accuracy}%` }}
            >
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="text-left mb-6">
          <h2 className="font-semibold text-lg mb-2">Weak Topics:</h2>
          {weakTopics.length === 0 ? (
            <p className="text-green-600">No weak topics 🎉</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {weakTopics.map((t, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 px-2 rounded hover:bg-gray-100"
                >
                  <span>{t.topic}</span>
                  <span className="text-red-500">{t.accuracy.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Dashboard
          </button>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold"
          >
            Restart Exam
          </button>
        </div>
      </div>
    </div>
  );
}