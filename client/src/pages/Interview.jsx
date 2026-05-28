import { useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import {
  FaRobot,
  FaBrain,
  FaChartLine,
} from "react-icons/fa";

function Interview() {
  const [role, setRole] = useState("");

  const [questions, setQuestions] = useState([]);

  const [selectedQuestion, setSelectedQuestion] =
    useState("");

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(false);

  const [evaluating, setEvaluating] =
    useState(false);

  // Generate AI Questions
  const generateQuestions = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "https://prepwise-ai-backend-a16j.onrender.com/api/ai/generate",
        {
          role,
        }
      );

      let generatedQuestions = res.data.questions;

      if (typeof generatedQuestions === "string") {
        generatedQuestions = generatedQuestions
          .split("\n")
          .filter((q) => q.trim() !== "");
      }

      setQuestions(generatedQuestions);

      setLoading(false);

    } catch (error) {
      console.log(error);

      setLoading(false);
    }
  };

  // Evaluate Answer
  const evaluateAnswer = async () => {
    try {
      setEvaluating(true);

      const res = await axios.post(
        "https://prepwise-ai-backend-a16j.onrender.com/api/evaluation/evaluate",
        {
          role,
          question: selectedQuestion,
          answer,
        }
      );

      setFeedback(res.data.feedback);

      setEvaluating(false);

    } catch (error) {
      console.log(error);

      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10 p-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <FaBrain className="text-cyan-400 text-5xl" />

          <div>
            <h1 className="text-5xl font-bold">
              PrepWise AI
            </h1>

            <p className="text-slate-400 mt-2">
              AI-Powered Interview Intelligence Platform
            </p>
          </div>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-5">
            Select Target Role
          </h2>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 outline-none"
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
          </select>

          <button
            onClick={generateQuestions}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-cyan-500/30"
          >
            {loading
              ? "Generating..."
              : "Generate AI Questions"}
          </button>
        </motion.div>

        {/* Questions */}
        {questions.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* Question Panel */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaRobot className="text-cyan-400 text-3xl" />

                <h2 className="text-3xl font-bold">
                  Interview Questions
                </h2>
              </div>

              <div className="flex flex-col gap-4">

                {questions.map((question, index) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={index}
                    onClick={() =>
                      setSelectedQuestion(question)
                    }
                    className={`cursor-pointer p-5 rounded-2xl border transition ${
                      selectedQuestion === question
                        ? "bg-cyan-500/20 border-cyan-400"
                        : "bg-slate-900/70 border-slate-800 hover:border-cyan-400"
                    }`}
                  >
                    <p>{question}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Answer Panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-purple-400 text-3xl" />

                <h2 className="text-3xl font-bold">
                  AI Evaluation
                </h2>
              </div>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                rows="8"
                placeholder="Type your interview answer here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 outline-none resize-none"
              ></textarea>

              <button
                onClick={evaluateAnswer}
                className="mt-6 bg-purple-500 hover:bg-purple-600 transition px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/30"
              >
                {evaluating
                  ? "Evaluating..."
                  : "Evaluate Answer"}
              </button>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 whitespace-pre-line"
                >
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                    AI Feedback
                  </h3>

                  <p className="text-slate-300 leading-8">
                    {feedback}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Interview;

