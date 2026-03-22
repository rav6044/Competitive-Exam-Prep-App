import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <button
        onClick={() => navigate("/exam")}
        className="mt-4 bg-green-500 text-white p-2 rounded"
      >
        Start Exam
      </button>
    </div>
  );
}