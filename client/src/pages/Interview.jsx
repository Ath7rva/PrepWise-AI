import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import axios from "axios";
import { motion } from "framer-motion";
import ProctorGuard from "../components/ProctorGuard";
import { API_URL } from "../config/api";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import {
  FaBrain,
  FaChartLine,
  FaChevronDown,
  FaMicrophone,
  FaPaperPlane,
  FaPlay,
  FaRobot,
  FaVolumeUp,
} from "react-icons/fa";

function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const proctorGuardRef = useRef(null);

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [techStack, setTechStack] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [practiceMode, setPracticeMode] = useState(
    location.state?.practiceMode || "standard"
  );
  const [targetedSkill, setTargetedSkill] = useState(
    location.state?.targetedSkill || ""
  );
  const [showAdvancedSetup, setShowAdvancedSetup] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [scores, setScores] = useState(null);
  const [sessionReport, setSessionReport] = useState(null);
  const [questionFeedback, setQuestionFeedback] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const [phase, setPhase] = useState("setup");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const selectedQuestion = questions[currentQuestionIndex] || "";
  const currentAnswer = answers[selectedQuestion] || "";

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every((question) => answers[question]?.trim());

  const allQuestionsEvaluated =
    questions.length > 0 &&
    questions.every((question) => feedbacks[question]?.trim());

  const canDownloadReport = allQuestionsAnswered && allQuestionsEvaluated;

  const showWarning = (message) => {
    setWarning(message);
    setTimeout(() => setWarning(""), 3000);
  };

  const terminateInterview = () => {
    stopListening();
    synthRef.current.cancel();
    setPhase("terminated");
  };

  const speak = (text, onEnd) => {
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;

    utterance.onstart = () => setAiSpeaking(true);
    utterance.onend = () => {
      setAiSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setAiSpeaking(false);
      onEnd?.();
    };

    synthRef.current.speak(utterance);
  };

  const startInterview = () => {
    if (!role) {
      showWarning("Please select a role first.");
      return;
    }

    setQuestions([]);
    setAnswers({});
    setFeedbacks({});
    setScores(null);
    setSessionReport(null);
    setQuestionFeedback([]);
    setSessionStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setPhase("permissions");
  };

  const handlePracticeModeChange = (value) => {
    setPracticeMode(value);

    if (value === "resume-jd") {
      setShowAdvancedSetup(true);
    }
  };

  const handleProctorReady = async () => {
    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/ai/generate`, {
        role,
        difficulty,
        experienceLevel,
        techStack,
        company,
        jobDescription,
        resumeText,
        practiceMode,
      });

      let generatedQuestions = res.data.questions;
      setTargetedSkill(res.data.targetedSkill || targetedSkill);

      if (typeof generatedQuestions === "string") {
        generatedQuestions = generatedQuestions
          .split("\n")
          .map((q) => q.trim())
          .filter(Boolean);
      }

      if (!generatedQuestions || generatedQuestions.length === 0) {
        showWarning("No questions generated. Try again.");
        setPhase("setup");
        return;
      }

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setPhase("interview");

      setTimeout(() => {
        readQuestion(generatedQuestions[0], 0);
      }, 500);
    } catch (error) {
      console.log(error);
      showWarning("Failed to generate questions.");
      setPhase("setup");
    } finally {
      setLoading(false);
    }
  };

  const readQuestion = (question, index) => {
    stopListening();

    speak(`Question ${index + 1}. ${question}`, () => {
      startListening(question);
    });
  };

  const startListening = (question) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showWarning("Speech recognition is only supported in Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setAnswers((prev) => ({
        ...prev,
        [question]: transcript.trim(),
      }));
    };

    recognition.onerror = (event) => {
      console.log(event.error);
      setListening(false);
      showWarning("Speech recognition stopped. You can still type your answer.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  const handleAnswerChange = (question, value) => {
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const submitAnswer = () => {
    if (!selectedQuestion) return;

    if (!currentAnswer.trim()) {
      showWarning("Please speak or type an answer before submitting.");
      return;
    }

    stopListening();

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    speak("Answer submitted.", () => {
      if (isLastQuestion) {
        evaluateFullInterview();
      } else {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);

        setTimeout(() => {
          readQuestion(questions[nextIndex], nextIndex);
        }, 500);
      }
    });
  };

  const evaluateFullInterview = async () => {
    try {
      setPhase("evaluating");
      setEvaluating(true);
      stopListening();

      const durationSeconds = sessionStartTime
        ? Math.round((Date.now() - sessionStartTime) / 1000)
        : 0;
      const proctoringMedia =
        (await proctorGuardRef.current?.getCapturedMedia?.()) || null;

      const res = await axios.post(`${API_URL}/api/evaluation/session`, {
        role,
        difficulty,
        experienceLevel,
        techStack,
        company,
        jobDescription,
        resumeText,
        practiceMode,
        targetedSkill,
        questions,
        answers,
        durationSeconds,
        proctoringMedia,
      });

      const newFeedbacks = {};

      res.data.questionFeedback.forEach((item) => {
        newFeedbacks[item.question] = item.feedback;
      });

      setFeedbacks(newFeedbacks);
      setScores(res.data.scores);
      setQuestionFeedback(res.data.questionFeedback || []);
      setSessionReport(res.data);
      setPhase("results");

      speak("Your interview has been completed. Your feedback report is ready.");
    } catch (error) {
      console.log(error);
      showWarning("Evaluation failed.");
      setPhase("interview");
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

    doc.save("PrepWise_Proctored_Interview_Report.pdf");
  };

  const getQuestionReview = (question) =>
    questionFeedback.find((item) => item.question === question) || {};

  return (
    <div className="relative min-h-screen bg-[#f4f7fb] text-slate-950 overflow-hidden">
      {(phase === "permissions" || phase === "interview" || phase === "evaluating") && (
        <ProctorGuard
          ref={proctorGuardRef}
          active={true}
          onReady={handleProctorReady}
          onTerminate={terminateInterview}
        />
      )}

      {warning && (
        <div className="fixed top-24 right-6 z-50 bg-red-500 text-slate-950 px-6 py-4 rounded-2xl shadow-lg animate-pulse">
          {warning}
        </div>
      )}

      <div className="relative z-10 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <FaBrain className="text-cyan-700 text-5xl" />

          <div>
            <h1 className="text-4xl md:text-5xl font-bold">PrepWise AI</h1>
            <p className="text-slate-400 mt-2">
              Proctored AI Interview Intelligence Platform
            </p>
          </div>
        </motion.div>

        {phase === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black mb-4">Start Interview</h2>
              <p className="text-slate-400 mb-6">
                Choose a role and press Start Interview. Everything else is optional.
              </p>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-600">
                  Role
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                >
                  <option value="">Choose Role</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </label>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">
                    Difficulty
                  </span>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="FAANG-style">FAANG-style</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-600">
                    Interview type
                  </span>
                  <select
                    value={practiceMode}
                    onChange={(e) => handlePracticeModeChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                  >
                    <option value="standard">Standard interview</option>
                    <option value="weak-area">Target weakest skill</option>
                    <option value="resume-jd">Use resume/job description</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedSetup((value) => !value)}
                className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left transition hover:bg-slate-50"
              >
                <span>
                  <span className="block font-black">Advanced personalization</span>
                  <span className="mt-1 block text-sm text-slate-400">
                    Optional: add experience, tech stack, resume, or job details.
                  </span>
                </span>
                <FaChevronDown
                  className={`shrink-0 text-cyan-700 transition ${
                    showAdvancedSetup ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvancedSetup && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-[#f4f7fb]/20 p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-600">
                        Experience level
                      </span>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                      >
                        <option value="">Not specified</option>
                        <option value="Fresher">Fresher</option>
                        <option value="0-1 years">0-1 years</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-600">
                        Target company
                      </span>
                      <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Optional"
                        className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Tech stack
                    </span>
                    <select
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400"
                    >
                      <option value="">Not specified</option>
                      <option value="React, JavaScript, CSS">React / JavaScript</option>
                      <option value="Node.js, Express, MongoDB">Node.js / Express / MongoDB</option>
                      <option value="Java, Spring Boot, SQL">Java / Spring Boot</option>
                      <option value="Python, SQL, Data Visualization">Python / SQL / Data</option>
                      <option value="AWS, Docker, CI/CD">AWS / Docker / DevOps</option>
                    </select>
                  </label>

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows="3"
                    placeholder="Optional: paste a job description"
                    className="mt-4 w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none resize-none focus:border-cyan-400"
                  />

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows="3"
                    placeholder="Optional: paste resume highlights, projects, or skills"
                    className="mt-4 w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 outline-none resize-none focus:border-cyan-400"
                  />
                </div>
              )}

              {practiceMode === "weak-area" && (
                <div className="mt-4 bg-slate-950/10 border border-cyan-500/20 rounded-2xl p-4 text-cyan-700">
                  PrepWise will target your lowest historical skill score when generating questions.
                </div>
              )}

              <button
                onClick={startInterview}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-cyan-700 hover:bg-cyan-800 text-white transition px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-slate-200"
              >
                <FaPlay />
                Start Interview
              </button>
            </div>

            <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black text-red-600 mb-5">Rules</h2>

              <div className="space-y-4 text-slate-600">
                <p>• Camera and microphone permissions are required.</p>
                <p>• The session stores 10 webcam photos and a 30-second recording for interview review.</p>
                <p>• Keep your face visible in the camera.</p>
                <p>• Do not switch tabs or click outside the interview window.</p>
                <p>• Right click, copy, paste, and developer tools shortcuts are restricted.</p>
                <p>• 10 warnings will terminate the interview.</p>
                <p>• AI will read each question aloud. After it finishes, speech-to-text starts automatically.</p>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "permissions" && (
          <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-10 text-center">
            <h2 className="text-4xl font-black text-cyan-700 mb-4">
              Preparing Proctored Interview
            </h2>
            <p className="text-slate-400">
              Allow camera and microphone permissions. Questions will start automatically after permissions are granted.
            </p>
            {loading && <p className="text-cyan-700 mt-6">Generating interview questions...</p>}
          </div>
        )}

        {phase === "interview" && selectedQuestion && (
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaRobot className="text-cyan-700 text-3xl" />
                <h2 className="text-2xl font-bold">Progress</h2>
              </div>

              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border ${
                      index === currentQuestionIndex
                        ? "bg-slate-950/20 border-cyan-400"
                        : answers[question]?.trim()
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <p className="font-bold">Question {index + 1}</p>
                    <p className="text-slate-400 text-sm line-clamp-2 mt-1">{question}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-cyan-700 font-bold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <h2 className="text-3xl font-black mt-2">Live Interview</h2>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {aiSpeaking && (
                    <span className="flex items-center gap-2 text-purple-300 bg-cyan-700/10 border border-purple-500/30 px-4 py-2 rounded-full">
                      <FaVolumeUp /> AI Speaking
                    </span>
                  )}

                  {listening && (
                    <span className="flex items-center gap-2 text-green-300 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full animate-pulse">
                      <FaMicrophone /> Listening
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-cyan-700 mb-3">Current Question</h3>
                <p className="text-slate-200 leading-8">{selectedQuestion}</p>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(selectedQuestion, e.target.value)}
                rows="9"
                placeholder="Your spoken answer will appear here. You can also type if speech recognition stops."
                className="w-full bg-white border border-slate-200 rounded-2xl p-5 outline-none resize-none"
              />

              <button
                onClick={submitAnswer}
                disabled={aiSpeaking}
                className={`mt-6 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition ${
                  aiSpeaking
                    ? "bg-slate-700 cursor-not-allowed opacity-60"
                    : "bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-slate-200"
                }`}
              >
                <FaPaperPlane />
                Submit Answer
              </button>
            </motion.div>
          </div>
        )}

        {phase === "evaluating" && (
          <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-10 text-center">
            <h2 className="text-4xl font-black text-indigo-700 mb-4">
              Evaluating Full Interview
            </h2>
            <p className="text-slate-400">
              AI is reviewing every answer and preparing your feedback report.
            </p>
            {evaluating && <p className="text-purple-300 mt-6">Please wait...</p>}
          </div>
        )}

        {phase === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-indigo-700 text-3xl" />
                <h2 className="text-4xl font-black">Interview Feedback</h2>
              </div>

              {scores && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    ["Technical", scores.technical],
                    ["Communication", scores.communication],
                    ["Confidence", scores.confidence],
                    ["Problem Solving", scores.problemSolving],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-white border border-slate-200 rounded-2xl p-5 text-center"
                    >
                      <div className="w-24 h-24 mx-auto">
                        <CircularProgressbar
                          value={value || 0}
                          text={`${value || 0}%`}
                          styles={buildStyles({
                            textcolor: "#0f172a",
                            pathColor: "#06b6d4",
                            trailColor: "#1e293b",
                          })}
                        />
                      </div>

                      <p className="mt-4 text-slate-600 font-semibold">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {sessionReport && (
                <div className="grid lg:grid-cols-3 gap-5 mb-8">
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-cyan-700 mb-3">
                      Session Summary
                    </h3>
                    <p className="text-slate-600 leading-8">
                      {sessionReport.feedback}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-indigo-700 mb-3">
                      Next Practice Plan
                    </h3>
                    <ul className="space-y-2 text-slate-600">
                      {(sessionReport.nextPracticePlan || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {questions.map((question, index) => {
                  const review = getQuestionReview(question);

                  return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-2xl p-6"
                  >
                    <h3 className="text-2xl font-bold text-cyan-700 mb-3">
                      Question {index + 1}
                    </h3>
                    <p className="text-slate-600 mb-5">{question}</p>

                    <h4 className="font-bold text-indigo-700 mb-2">Your Answer</h4>
                    <p className="text-slate-600 whitespace-pre-line mb-5">
                      {answers[question]}
                    </p>

                    <h4 className="font-bold text-emerald-700 mb-2">AI Feedback</h4>
                    <p className="text-slate-600 whitespace-pre-line leading-8">
                      {feedbacks[question]}
                    </p>

                    {review.betterAnswer && (
                      <>
                        <h4 className="font-bold text-amber-600 mb-2 mt-5">
                          Stronger Sample Answer
                        </h4>
                        <p className="text-slate-600 whitespace-pre-line leading-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                          {review.betterAnswer}
                        </p>
                      </>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 text-center">
              <h2 className="text-3xl font-bold text-cyan-700 mb-3">
                Download Report
              </h2>
              <p className="text-slate-400 mb-6">
                Download the full interview report with questions, answers, scores, and AI feedback.
              </p>

              <button
                onClick={downloadReport}
                disabled={!canDownloadReport}
                className="px-8 py-4 rounded-2xl font-semibold text-lg bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition"
              >
                Download Full PDF Report
              </button>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="fixed bottom-6 left-6 z-40 bg-white/10 hover:bg-white/15 border border-white/15 px-6 py-4 rounded-2xl font-black transition shadow-2xl backdrop-blur-xl"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}

        {phase === "terminated" && (
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-3xl p-10 text-center">
            <h2 className="text-5xl font-black text-red-600 mb-4">
              Interview Terminated
            </h2>
            <p className="text-slate-600">
              The interview was terminated because the maximum warning limit was reached.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Interview;



