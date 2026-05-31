import { useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import { motion } from "framer-motion";


import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import {
  FaRobot,
  FaBrain,
  FaChartLine,
  FaMicrophone,
  FaStop,
} from "react-icons/fa";
 
function Interview() {
  const [warning, setWarning] = useState("");
  const [listening, setListening] = useState(false);
  const [displayedFeedback, setDisplayedFeedback] = useState("");
  const [scores, setScores] = useState(null);
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const currentAnswer = answers[selectedQuestion] || "";
  const allQuestionsAnswered =
  questions.length > 0 &&
  questions.every((question) => answers[question]?.trim());

const allQuestionsEvaluated =
  questions.length > 0 &&
  questions.every((question) => feedbacks[question]?.trim());

const canDownloadReport =
  allQuestionsAnswered && allQuestionsEvaluated;
  const currentFeedback = feedbacks[selectedQuestion] || "";

  const startListening = () => {
  if (!selectedQuestion) {
    alert("Please select a question first.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Use Chrome.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  setListening(true);

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    handleAnswerChange(
      selectedQuestion,
      `${currentAnswer} ${transcript}`.trim()
    );
  };

  recognition.onerror = (event) => {
    console.log(event.error);
    alert("Speech recognition failed. Try again.");
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };
};

  const handleAnswerChange = (question, value) => {
    setAnswers({
      ...answers,
      [question]: value,
    });
  };

  const typeFeedback = (text) => {
  setDisplayedFeedback("");

  let index = 0;

  const interval = setInterval(() => {
    setDisplayedFeedback((prev) => prev + text.charAt(index));
    index++;

    if (index >= text.length) {
      clearInterval(interval);
    }
  }, 15);
};

  const generateQuestions = async () => {
    if (!role) {
      setWarning("Please select a role first.");
      return;
    }

    try {
      setLoading(true);
      setQuestions([]);
      setSelectedQuestion("");
      setAnswers({});
      setFeedbacks({});

      const res = await axios.post(
        "https://prepwise-ai-backend-a16j.onrender.com/api/ai/generate",
        { role }
      );

      let generatedQuestions = res.data.questions;

      if (typeof generatedQuestions === "string") {
        generatedQuestions = generatedQuestions
          .split("\n")
          .filter((q) => q.trim() !== "");
      }

      setQuestions(generatedQuestions);
    } catch (error) {
      console.log(error);
      alert("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateAllAnswers = async () => {
  const unansweredQuestion = questions.find(
    (question) => !answers[question]?.trim()
  );

  if (unansweredQuestion) {
    setSelectedQuestion(unansweredQuestion);
    setWarning("Answer all questions before evaluating");

    setTimeout(() => {
      setWarning("");
    }, 3000);

    return;
  }

  try {
    setEvaluating(true);

    const newFeedbacks = {};

    for (const question of questions) {
      const res = await axios.post(
        "https://prepwise-ai-backend-a16j.onrender.com/api/evaluation/evaluate",
        {
          role,
          question,
          answer: answers[question],
        }
      );

      newFeedbacks[question] = res.data.feedback;
    }

    setFeedbacks(newFeedbacks);
  } catch (error) {
    console.log(error);
    alert("Evaluation failed.");
  } finally {
    setEvaluating(false);
  }
};

  const evaluateAnswer = async () => {
    if (!selectedQuestion) {
      alert("Please select a question first.");
      return;
    }

    if (!currentAnswer.trim()) {
      alert("Please provide an answer before evaluating.");
      return;
    }

    try {
      setEvaluating(true);

      const res = await axios.post(
        "https://prepwise-ai-backend-a16j.onrender.com/api/evaluation/evaluate",
        {
          role,
          question: selectedQuestion,
          answer: currentAnswer,
        }
      );

      setFeedbacks({
        ...feedbacks,
        [selectedQuestion]: res.data.feedback,
      });
      typeFeedback(res.data.feedback);
      setScores({
        technical: 86,
        communication: 78,
        confidence: 82,
        problemSolving: 88,
      });
    } catch (error) {
      console.log(error);
      alert("Evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22);
    doc.text("PrepWise AI Interview Report", 20, y);

    y += 15;

    doc.setFontSize(14);
    doc.text(`Role: ${role}`, 20, y);

    y += 15;

    questions.forEach((question, index) => {
      const answerText = answers[question] || "Not answered";
      const feedbackText = feedbacks[question] || "Not evaluated";

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);
      doc.text(`Question ${index + 1}`, 20, y);
      y += 10;

      doc.setFontSize(12);
      doc.text("Question:", 20, y);
      y += 7;

      const questionLines = doc.splitTextToSize(question, 170);
      doc.text(questionLines, 20, y);
      y += questionLines.length * 7 + 5;

      doc.text("Answer:", 20, y);
      y += 7;

      const answerLines = doc.splitTextToSize(answerText, 170);
      doc.text(answerLines, 20, y);
      y += answerLines.length * 7 + 5;

      doc.text("AI Feedback:", 20, y);
      y += 7;

      const feedbackLines = doc.splitTextToSize(feedbackText, 170);

      feedbackLines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, 20, y);
        y += 7;
      });

      y += 12;
    });

    doc.save("PrepWise_Full_Interview_Report.pdf");
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Warning Popup */}
    {warning && (
      <div className="fixed top-6 right-6 z-50 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-lg animate-pulse">
        {warning}
      </div>
    )}
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10 p-10">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <FaBrain className="text-cyan-400 text-5xl" />

          <div>
            <h1 className="text-5xl font-bold">PrepWise AI</h1>
            <p className="text-slate-400 mt-2">
              AI-Powered Interview Intelligence Platform
            </p>
          </div>
        </motion.div>

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
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Java Developer">Java Developer</option>
          </select>

          <button
            onClick={generateQuestions}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-cyan-500/30"
          >
            {loading ? "Generating..." : "Generate AI Questions"}
          </button>
        </motion.div>

        {questions.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
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
                    onClick={() => {
                    setSelectedQuestion(question);
                    setDisplayedFeedback(feedbacks[question] || "");
                    }}
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

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-purple-400 text-3xl" />
                <h2 className="text-3xl font-bold">AI Evaluation</h2>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) =>
                  handleAnswerChange(selectedQuestion, e.target.value)
                }
                rows="8"
                disabled={!selectedQuestion}
                placeholder={
                  selectedQuestion
                    ? "Type your interview answer here..."
                    : "Select a question first..."
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 outline-none resize-none disabled:opacity-50"
              ></textarea>

              <button
  onClick={startListening}
  className={`mt-4 flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition ${
    listening
      ? "bg-red-500 hover:bg-red-600"
      : "bg-cyan-500 hover:bg-cyan-600"
  }`}
>
  {listening ? <FaStop /> : <FaMicrophone />}
  {listening ? "Listening..." : "Speak Answer"}
</button>

              <button
                onClick={evaluateAllAnswers}
                className="mt-6 bg-purple-500 hover:bg-purple-600 transition px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/30"
              >
                {evaluating ? "Evaluating All Answers..." : "Evaluate Full Interview"}
              </button>

              {currentFeedback && (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 whitespace-pre-line"
    >
      <h3 className="text-2xl font-bold text-cyan-400 mb-4">
        AI Feedback
      </h3>

      <p className="text-slate-300 leading-8">
        {displayedFeedback}
      </p>
    </motion.div>

    {/* Score Rings */}
    {scores && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {[
          ["Technical", scores.technical],
          ["Communication", scores.communication],
          ["Confidence", scores.confidence],
          ["Problem Solving", scores.problemSolving],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center"
          >
            <div className="w-24 h-24 mx-auto">
              <CircularProgressbar
                value={value}
                text={`${value}%`}
                styles={buildStyles({
                  textColor: "#ffffff",
                  pathColor: "#06b6d4",
                  trailColor: "#1e293b",
                })}
              />
            </div>

            <p className="mt-4 text-slate-300 font-semibold">
              {label}
            </p>
          </div>
        ))}
      </div>
    )}
  </>
)}

              
            </motion.div>
          </div>
        )}
        {questions.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center"
  >
    <h2 className="text-3xl font-bold text-cyan-400 mb-3">
      Interview Report
    </h2>

    <p className="text-slate-400 mb-6">
      Answer and evaluate all questions to unlock your full AI interview report.
    </p>

    <button
      onClick={downloadReport}
      disabled={!canDownloadReport}
      className={`px-8 py-4 rounded-2xl font-semibold text-lg transition ${
        canDownloadReport
          ? "bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/30"
          : "bg-slate-700 cursor-not-allowed opacity-60"
      }`}
    >
      {canDownloadReport
        ? "Download Full PDF Report"
        : "Complete All Evaluations First"}
    </button>
  </motion.div>
)}
      </div>
    </div>
  );
}

export default Interview;