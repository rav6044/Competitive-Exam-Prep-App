export default function SidebarNavigator({
  questions = [],
  answers = {},
  onSelect,
}) {
  return (
    <div className="grid grid-cols-5 gap-2 p-2">
      {questions.map((q, index) => {
        const answered = answers?.[q._id]; // ✅ SAFE ACCESS

        return (
          <button
            key={q._id || index}
            onClick={() => onSelect(index)}
            className={`p-2 rounded text-white ${
              answered ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}