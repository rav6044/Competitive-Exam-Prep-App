import React from "react";

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  index,
}) {
  if (!question) return null;

  return (
    <div className="bg-white p-6 rounded shadow">
      
      {/* QUESTION TITLE */}
      <h2 className="text-lg font-semibold mb-4">
        Q{index + 1}. {question.text}
      </h2>

      {/* OPTIONS */}
      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              className={`w-full text-left p-3 border rounded transition
                ${
                  isSelected
                    ? "bg-green-200 border-green-500"
                    : "hover:bg-gray-100"
                }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}