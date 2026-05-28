import { useState } from "react";
import axios from "axios";

function Interview() {
  const [role, setRole] = useState("");

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/ai/generate",
        {
          role,
        }
      );

      let generatedQuestions = res.data.questions;

      // Convert string response into array
      if (typeof generatedQuestions === "string") {
        generatedQuestions = generatedQuestions
          .split("\n")
          .filter((q) => q.trim() !== "");
      }

      setQuestions(generatedQuestions);

      setLoading(false);

    } catch (error) {
      console.log(error);

      alert("Failed to generate questions");

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        AI Mock Interview
      </h1>

      {/* Role Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl">
        <h2 className="text-2xl font-semibold mb-6">
          Select Your Target Role
        </h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
        >
          <option value="">Choose Role</option>

          <option value="Frontend Developer">
            Frontend Developer
          </option>

          <option value="Backend Developer">
            Backend Developer
          </option>

          <option value="Full Stack Developer">
            Full Stack Developer
          </option>

          <option value="Java Developer">
            Java Developer
          </option>

          <option value="Python Developer">
            Python Developer
          </option>
        </select>

        <button
          onClick={generateQuestions}
          className="mt-6 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl text-lg font-semibold transition"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div className="mt-10 max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">
            Interview Questions
          </h2>

          <div className="flex flex-col gap-5">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <h3 className="text-cyan-400 font-semibold mb-3">
                  Question {index + 1}
                </h3>

                <p className="text-lg">
                  {question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;

