import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API_URL } from "../config/api";

function History() {
  
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchHistory() {
    try {
      const res = await axios.get(`${API_URL}/api/history`);
      setInterviews(res.data);

      if (res.data.length > 0) {
        setSelectedInterview(res.data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getQuestions = (item) => item.questions || [];
  const getPrimaryQuestion = (item) =>
    getQuestions(item)[0]?.question || item.question || "Full interview session";
  const getPrimaryFeedback = (item) =>
    getQuestions(item)[0]?.feedback || item.feedback || "Not available.";
  const getArrayText = (items) =>
    Array.isArray(items) && items.length ? items.join("\n") : "Not available.";
  const getSelectedQuestion = () =>
    getQuestions(selectedInterview)[selectedQuestionIndex] ||
    getQuestions(selectedInterview)[0] ||
    null;
  const selectInterview = (item) => {
    setSelectedInterview(item);
    setSelectedQuestionIndex(0);
  };

  const filteredInterviews = interviews.filter((item) => {
    const role = item.role || "";
    const question = getPrimaryQuestion(item);

    const matchesSearch =
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "strong" && item.score >= 80) ||
      (filter === "average" && item.score >= 60 && item.score < 80) ||
      (filter === "weak" && item.score < 60);

    return matchesSearch && matchesFilter;
  });

  const averageScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((sum, item) => sum + (item.score || 0), 0) /
            interviews.length
        )
      : 0;

  const bestScore =
    interviews.length > 0
      ? Math.max(...interviews.map((item) => item.score || 0))
      : 0;

      const extractSection = (text, sectionName) => {
  if (!text) return "Not available.";

  const regex = new RegExp(
    `${sectionName}:([\\s\\S]*?)(Strengths:|Weaknesses:|Improvements:|$)`,
    "i"
  );

  const match = text.match(regex);

  return match ? match[1].trim() : "Not available.";
};

  return (
    <div className="relative min-h-screen bg-[#f4f7fb] text-slate-950 overflow-hidden p-6 md:p-10">
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-cyan-700 font-semibold mb-2">
            PrepWise Intelligence
          </p>

          <h1 className="text-4xl md:text-6xl font-black">
            Session Review
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Analyze your past interview performance, answers, and AI feedback.
          </p>
        </motion.div>

        {interviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400">
            No interview history found yet.
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <p className="text-slate-400">Total Sessions</p>
                <p className="text-4xl font-black mt-2">
                  {interviews.length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <p className="text-slate-400">Average Score</p>
                <p className="text-4xl font-black mt-2 text-cyan-700">
                  {averageScore}%
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <p className="text-slate-400">Best Score</p>
                <p className="text-4xl font-black mt-2 text-emerald-700">
                  {bestScore}%
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Search by role or question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
              >
                <option value="all" className="bg-[#f4f7fb]">
                  All Scores
                </option>
                <option value="strong" className="bg-[#f4f7fb]">
                  Strong 80%+
                </option>
                <option value="average" className="bg-[#f4f7fb]">
                  Average 60-79%
                </option>
                <option value="weak" className="bg-[#f4f7fb]">
                  Needs Work &lt;60%
                </option>
              </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-5">
                {filteredInterviews.map((item) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={item._id}
                    onClick={() => selectInterview(item)}
                    className={`cursor-pointer backdrop-blur-xl bg-white border rounded-3xl p-6 transition ${
                      selectedInterview?._id === item._id
                        ? "border-cyan-400"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-cyan-700">
                          {item.role || "AI Interview"}
                        </h2>

                        <p className="text-slate-500 text-sm mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-3xl font-black ${getScoreColor(
                            item.score || 0
                          )}`}
                        >
                          {item.score || 0}%
                        </p>
                        <p className="text-xs text-slate-500">AI Score</p>
                      </div>
                    </div>

                    <p className="text-slate-600 mt-5 line-clamp-2">
                      {getPrimaryQuestion(item)}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedInterview ? (
                  <motion.div
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                      <div>
                        <p className="text-slate-400">Selected Session</p>
                        <h2 className="text-3xl font-black text-slate-950 mt-1">
                          {selectedInterview.role || "AI Interview"}
                        </h2>
                      </div>

                      <div className="w-28 h-28 rounded-full border-8 border-cyan-400 flex items-center justify-center">
                        <span className="text-3xl font-black">
                          {selectedInterview.score || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-[#f4f7fb]/40 rounded-2xl p-5 border border-slate-200">
                        <p className="text-slate-500 text-sm">Date</p>
                        <p className="font-bold mt-1">
                          {new Date(
                            selectedInterview.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="bg-[#f4f7fb]/40 rounded-2xl p-5 border border-slate-200">
                        <p className="text-slate-500 text-sm">Type</p>
                        <p className="font-bold mt-1">AI Practice</p>
                      </div>

                      <div className="bg-[#f4f7fb]/40 rounded-2xl p-5 border border-slate-200">
                        <p className="text-slate-500 text-sm">Status</p>
                        <p className="font-bold mt-1 text-emerald-700">
                          Completed
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h3 className="text-xl font-bold text-cyan-700 mb-3">
                          Session Summary
                        </h3>
                        <div className="bg-[#f4f7fb]/40 border border-slate-200 rounded-2xl p-5 text-slate-600 leading-8">
                          {selectedInterview.feedback || getPrimaryFeedback(selectedInterview)}
                        </div>
                      </section>

                      <QuestionReview
                        questions={getQuestions(selectedInterview)}
                        selectedIndex={selectedQuestionIndex}
                        onSelect={setSelectedQuestionIndex}
                        selectedQuestion={getSelectedQuestion()}
                        getScoreColor={getScoreColor}
                        getArrayText={getArrayText}
                      />

                      <section>
  <h3 className="text-xl font-bold text-emerald-700 mb-3">
    AI Feedback Breakdown
  </h3>
  <section>
  <h3 className="text-xl font-bold text-amber-600 mb-3">
    Better Answer
  </h3>

  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 text-slate-600">
        {getQuestions(selectedInterview)[0]?.betterAnswer || "Not available yet."}
  </div>
</section>

  <div className="grid md:grid-cols-3 gap-4">
    <div className="bg-[#f4f7fb]/40 border border-green-500/20 rounded-2xl p-5">
      <h4 className="font-bold text-emerald-700 mb-3">Strengths</h4>
      <p className="text-slate-600 whitespace-pre-line">
        {getArrayText(selectedInterview.strengths) ||
          extractSection(selectedInterview.feedback, "Strengths")}
      </p>
    </div>

    <div className="bg-[#f4f7fb]/40 border border-red-500/20 rounded-2xl p-5">
      <h4 className="font-bold text-red-600 mb-3">Weaknesses</h4>
      <p className="text-slate-600 whitespace-pre-line">
        {getArrayText(selectedInterview.weaknesses) ||
          extractSection(selectedInterview.feedback, "Weaknesses")}
      </p>
    </div>

    <div className="bg-[#f4f7fb]/40 border border-cyan-500/20 rounded-2xl p-5">
      <h4 className="font-bold text-cyan-700 mb-3">Improvements</h4>
      <p className="text-slate-600 whitespace-pre-line">
        {getArrayText(selectedInterview.improvements) ||
          extractSection(selectedInterview.feedback, "Improvements")}
      </p>
    </div>
  </div>
</section>

                      {getQuestions(selectedInterview).length > 1 && (
                        <section>
                          <h3 className="text-xl font-bold text-cyan-700 mb-3">
                            Full Question Review
                          </h3>

                          <div className="grid gap-3 md:grid-cols-2">
                            {getQuestions(selectedInterview).map((item, index) => (
                              <button
                                type="button"
                                key={`${item.question}-${index}`}
                                onClick={() => setSelectedQuestionIndex(index)}
                                className={`text-left bg-[#f4f7fb]/40 border rounded-2xl p-5 transition hover:border-cyan-400 hover:bg-white ${
                                  selectedQuestionIndex === index
                                    ? "border-cyan-500 ring-2 ring-cyan-500/20"
                                    : "border-slate-200"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <h4 className="font-bold text-slate-950">
                                    Question {index + 1}
                                  </h4>
                                  <span className={getScoreColor(item.score || 0)}>
                                    {item.score || 0}%
                                  </span>
                                </div>
                                <p className="text-cyan-700 line-clamp-2">{item.question}</p>
                                <p className="mt-3 text-sm font-bold text-slate-500">
                                  Click to view answer and feedback
                                </p>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-10 text-center">
                    <div>
                      <h2 className="text-3xl font-black mb-3">
                        Select an Interview
                      </h2>
                      <p className="text-slate-400">
                        Click a session from the left to view the full AI review.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestionReview({
  questions,
  selectedIndex,
  onSelect,
  selectedQuestion,
  getScoreColor,
  getArrayText,
}) {
  if (!selectedQuestion) {
    return (
      <section>
        <h3 className="text-xl font-bold text-cyan-700 mb-3">
          Question Review
        </h3>
        <div className="bg-[#f4f7fb]/40 border border-slate-200 rounded-2xl p-5 text-slate-600">
          No question details are available for this session.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-cyan-700">
            Question {selectedIndex + 1} Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select a question to inspect its answer, feedback, and coaching notes.
          </p>
        </div>

        <div className={`text-2xl font-black ${getScoreColor(selectedQuestion.score || 0)}`}>
          {selectedQuestion.score || 0}%
        </div>
      </div>

      {questions.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`rounded-xl border px-4 py-2 text-sm font-black transition ${
                selectedIndex === index
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400"
              }`}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-[#f4f7fb]/40 p-5">
        <DetailBlock
          title="Question"
          color="text-cyan-700"
          text={selectedQuestion.question}
        />
        <DetailBlock
          title="Your Answer"
          color="text-indigo-700"
          text={selectedQuestion.answer || "No answer was provided."}
        />
        <DetailBlock
          title="AI Feedback"
          color="text-emerald-700"
          text={selectedQuestion.feedback || "No feedback is available."}
        />
        <DetailBlock
          title="Better Answer"
          color="text-amber-600"
          text={selectedQuestion.betterAnswer || "Not available yet."}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <DetailBlock
            title="Strengths"
            color="text-emerald-700"
            text={getArrayText(selectedQuestion.strengths)}
          />
          <DetailBlock
            title="Weaknesses"
            color="text-red-600"
            text={getArrayText(selectedQuestion.weaknesses)}
          />
          <DetailBlock
            title="Improvements"
            color="text-cyan-700"
            text={getArrayText(selectedQuestion.improvements)}
          />
        </div>
      </div>
    </section>
  );
}

function DetailBlock({ title, color, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h4 className={`mb-2 font-black ${color}`}>{title}</h4>
      <p className="whitespace-pre-line leading-7 text-slate-600">{text}</p>
    </div>
  );
}

export default History;



