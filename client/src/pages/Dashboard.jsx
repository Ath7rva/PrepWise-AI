import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FaBrain,
  FaChartLine,
  FaHistory,
  FaMicrophoneAlt,
  FaRocket,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrophy,
  FaUserGraduate,
  FaBolt,
  FaFire,
  FaArrowUp,
  FaExclamationTriangle,
} from "react-icons/fa";
import { API_URL } from "../config/api";

function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const [analyticsRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics`),
        axios.get(`${API_URL}/api/history`),
      ]);

      setAnalytics(analyticsRes.data);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const safeAnalytics = analytics || {
    totalInterviews: 0,
    averageScore: 0,
    chartData: [],
    recentInterviews: [],
  };

  const bestScore = useMemo(() => {
    if (!history.length) return 0;
    return Math.max(...history.map((item) => item.score || 0));
  }, [history]);

  const latestScore = useMemo(() => {
    if (!history.length) return 0;
    const latest = [...history].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return latest?.score || 0;
  }, [history]);

  const readinessScore = useMemo(() => {
    const avg = safeAnalytics.averageScore || 0;
    const volumeBonus = Math.min((safeAnalytics.totalInterviews || 0) * 2, 12);
    const consistencyBonus = latestScore >= avg ? 6 : 0;

    return Math.min(100, Math.round(avg * 0.82 + volumeBonus + consistencyBonus));
  }, [safeAnalytics.averageScore, safeAnalytics.totalInterviews, latestScore]);

  const skillAverages = useMemo(() => {
    if (!history.length) {
      return {
        technical: 0,
        communication: 0,
        confidence: 0,
        problemSolving: 0,
      };
    }

    const avg = (key) =>
      Math.round(
        history.reduce((sum, item) => sum + (item[key] || 0), 0) / history.length
      );

    return {
      technical: avg("technicalScore"),
      communication: avg("communicationScore"),
      confidence: avg("confidenceScore"),
      problemSolving: avg("problemSolvingScore"),
    };
  }, [history]);

  const strongestSkill = useMemo(() => {
    const entries = Object.entries(skillAverages);
    const [skill, value] = entries.sort((a, b) => b[1] - a[1])[0] || ["None", 0];

    return {
      label: formatSkillName(skill),
      value,
    };
  }, [skillAverages]);

  const weakestSkill = useMemo(() => {
    const entries = Object.entries(skillAverages).filter(([, value]) => value > 0);

    if (!entries.length) {
      return {
        label: "Not enough data",
        value: 0,
      };
    }

    const [skill, value] = entries.sort((a, b) => a[1] - b[1])[0];

    return {
      label: formatSkillName(skill),
      value,
    };
  }, [skillAverages]);

  const aiInsight = useMemo(() => {
    if (!history.length) {
      return "Start your first proctored interview to unlock personalized AI readiness insights and progress tracking.";
    }

    if (readinessScore >= 85) {
      return `Excellent momentum. Your AI readiness score is ${readinessScore}%. Keep practicing harder role-specific questions to stay interview-ready.`;
    }

    if (weakestSkill.value > 0) {
      return `Your strongest area is ${strongestSkill.label}, while ${weakestSkill.label} needs the most attention. Practice weak-area interviews next for faster improvement.`;
    }

    return "You have interview data, but skill-level scores are still limited. Complete a full evaluation to unlock deeper insights.";
  }, [history.length, readinessScore, strongestSkill, weakestSkill]);

  const recentSessions = useMemo(() => {
    if (safeAnalytics.recentInterviews?.length) {
      return safeAnalytics.recentInterviews;
    }

    return history
      .slice(-5)
      .reverse()
      .map((item) => ({
        role: item.role,
        score: item.score || 0,
        date: item.createdAt,
      }));
  }, [safeAnalytics.recentInterviews, history]);

  const scoreStatus = getScoreStatus(readinessScore);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-xl text-slate-600">Loading PrepWise Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f4f7fb] text-slate-950 overflow-hidden">
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-slate-200 backdrop-blur-xl bg-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-950/20 border border-cyan-400/30 flex items-center justify-center">
            <FaBrain className="text-cyan-700 text-xl" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-950">PrepWise AI</h1>
            <p className="text-xs text-slate-400">Interview Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/analytics")}
            className="hidden md:block bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2 rounded-xl transition"
          >
            Analytics
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-5 py-2 rounded-xl transition flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </nav>

      <main className="relative z-10 p-6 md:p-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="lg:col-span-2 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-slate-950/10 border border-cyan-500/20 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FaBolt />
              AI-powered career preparation cockpit
            </div>

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Welcome back,{" "}
              <span className="text-cyan-700">{user?.name || "Candidate"}</span>
            </h2>

            <p className="text-slate-400 text-lg mt-5 max-w-3xl">
              Track your interview readiness, review recent performance, and launch
              proctored AI interviews from one professional dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => navigate("/interview")}
                className="bg-slate-950 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-black text-lg transition shadow-lg shadow-slate-200 flex items-center justify-center gap-3"
              >
                <FaShieldAlt />
                Start Proctored Interview
              </button>

              <button
                onClick={() => navigate("/history")}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-7 py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3"
              >
                <FaHistory />
                Review Sessions
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400">AI Readiness</p>
                <h3 className={`text-5xl font-black mt-2 ${scoreStatus.color}`}>
                  {readinessScore}%
                </h3>
              </div>

              <div className={`w-20 h-20 rounded-full border-8 ${scoreStatus.ring} flex items-center justify-center`}>
                <FaRocket className={scoreStatus.color} />
              </div>
            </div>

            <p className="text-slate-600 leading-7">{scoreStatus.message}</p>

            <div className="mt-6 bg-[#f4f7fb]/40 border border-slate-200 rounded-2xl p-4">
              <p className="text-sm text-slate-500">Recommended next action</p>
              <p className="font-bold mt-1 text-cyan-700">
                {weakestSkill.value > 0
                  ? `Practice ${weakestSkill.label}`
                  : "Complete one full interview"}
              </p>
            </div>
          </div>
        </motion.section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<FaUserGraduate />}
            title="Total Interviews"
            value={safeAnalytics.totalInterviews}
            subtitle="Completed sessions"
            color="text-cyan-700"
          />

          <StatCard
            icon={<FaChartLine />}
            title="Average Score"
            value={`${safeAnalytics.averageScore || 0}%`}
            subtitle="Across all interviews"
            color="text-emerald-700"
          />

          <StatCard
            icon={<FaTrophy />}
            title="Best Score"
            value={`${bestScore}%`}
            subtitle="Highest performance"
            color="text-amber-600"
          />

          <StatCard
            icon={<FaFire />}
            title="Latest Score"
            value={`${latestScore}%`}
            subtitle="Most recent attempt"
            color="text-indigo-700"
          />
        </section>

        <section className="grid xl:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black">Performance Trend</h3>
                <p className="text-slate-400 mt-2">
                  Real score movement from your interview history.
                </p>
              </div>

              <button
                onClick={() => navigate("/analytics")}
                className="bg-slate-950/10 hover:bg-slate-950/20 border border-cyan-500/20 text-cyan-700 px-4 py-2 rounded-xl font-bold transition"
              >
                Open Analytics
              </button>
            </div>

            {safeAnalytics.chartData?.length ? (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeAnalytics.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "16px",
                        color: "#0f172a",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={4}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyPanel message="No performance chart yet. Complete an interview to generate trends." />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <h3 className="text-3xl font-black mb-2">Skill Intelligence</h3>
            <p className="text-slate-400 mb-6">
              Breakdown from evaluated interview scores.
            </p>

            <div className="space-y-5">
              <SkillBar label="Technical" value={skillAverages.technical} />
              <SkillBar label="Communication" value={skillAverages.communication} />
              <SkillBar label="Confidence" value={skillAverages.confidence} />
              <SkillBar label="Problem Solving" value={skillAverages.problemSolving} />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Strongest</p>
                <p className="font-black text-emerald-700 mt-1">
                  {strongestSkill.value > 0 ? strongestSkill.label : "Pending"}
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Weakest</p>
                <p className="font-black text-red-600 mt-1">
                  {weakestSkill.value > 0 ? weakestSkill.label : "Pending"}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <FaBrain className="text-cyan-700 text-3xl" />
              <h3 className="text-3xl font-black">AI Coach Insight</h3>
            </div>

            <p className="text-slate-600 leading-8">{aiInsight}</p>

            <button
              onClick={() =>
                navigate("/interview", {
                  state: {
                    practiceMode: weakestSkill.value > 0 ? "weak-area" : "standard",
                    targetedSkill: weakestSkill.label,
                  },
                })
              }
              className="mt-7 w-full bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-4 rounded-2xl font-black transition shadow-lg shadow-slate-200"
            >
              Practice Recommended Area
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-7">
              <div>
                <h3 className="text-3xl font-black">Recent Sessions</h3>
                <p className="text-slate-400 mt-2">
                  Latest interview attempts from your real history.
                </p>
              </div>

              <button
                onClick={() => navigate("/history")}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl font-bold transition"
              >
                View All
              </button>
            </div>

            {recentSessions.length ? (
              <div className="space-y-4">
                {recentSessions.slice(0, 5).map((item, index) => (
                  <div
                    key={`${item.role}-${item.date}-${index}`}
                    className="bg-[#f4f7fb]/40 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xl font-black text-cyan-700">
                        {item.role || "AI Interview"}
                      </h4>

                      <p className="text-slate-500 mt-1">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-black ${getScoreColor(item.score || 0)}`}>
                        {item.score || 0}%
                      </div>

                      <button
                        onClick={() => navigate("/history")}
                        className="bg-slate-950/10 hover:bg-slate-950/20 border border-cyan-500/20 text-cyan-700 px-4 py-2 rounded-xl font-bold transition"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel message="No interview sessions yet. Start a proctored interview to populate this section." />
            )}
          </motion.div>
        </section>

        <section className="grid md:grid-cols-4 gap-5 mt-8">
          <QuickAction
            icon={<FaShieldAlt />}
            title="Proctored Interview"
            text="Camera, warnings, voice flow"
            onClick={() => navigate("/interview")}
          />

          <QuickAction
            icon={<FaMicrophoneAlt />}
            title="Voice Practice"
            text="Answer with speech-to-text"
            onClick={() => navigate("/interview")}
          />

          <QuickAction
            icon={<FaHistory />}
            title="Session Review"
            text="Review answers and feedback"
            onClick={() => navigate("/history")}
          />

          <QuickAction
            icon={<FaChartLine />}
            title="Deep Analytics"
            text="Track score trends"
            onClick={() => navigate("/analytics")}
          />
        </section>

        {safeAnalytics.totalInterviews === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 flex gap-4 items-start"
          >
            <FaExclamationTriangle className="text-amber-600 text-2xl mt-1" />
            <div>
              <h3 className="text-xl font-black text-amber-700">
                Dashboard is ready, but needs interview data
              </h3>
              <p className="text-slate-600 mt-2">
                Complete one interview evaluation to unlock real trends, readiness score,
                recent sessions, and skill intelligence.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>

        <FaArrowUp className="text-emerald-700/70" />
      </div>

      <p className="text-slate-400 mt-5">{title}</p>
      <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
      <p className="text-slate-500 text-sm mt-2">{subtitle}</p>
    </motion.div>
  );
}

function SkillBar({ label, value }) {
  const safeValue = value || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-slate-600">{label}</p>
        <p className="text-slate-400">{safeValue}%</p>
      </div>

      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-700 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(safeValue, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, text, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={onClick}
      className="text-left backdrop-blur-xl bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl p-6 transition"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-950/10 border border-cyan-500/20 text-cyan-700 flex items-center justify-center text-xl mb-5">
        {icon}
      </div>

      <h4 className="text-xl font-black">{title}</h4>
      <p className="text-slate-400 mt-2">{text}</p>
    </motion.button>
  );
}

function EmptyPanel({ message }) {
  return (
    <div className="min-h-[220px] bg-[#f4f7fb]/40 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-center p-8">
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

function formatSkillName(skill) {
  const map = {
    technical: "Technical",
    communication: "Communication",
    confidence: "Confidence",
    problemSolving: "Problem Solving",
  };

  return map[skill] || skill;
}

function getScoreColor(score) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function getScoreStatus(score) {
  if (score >= 85) {
    return {
      color: "text-emerald-700",
      ring: "border-green-400",
      message: "Interview-ready profile. Keep challenging yourself with harder role-specific rounds.",
    };
  }

  if (score >= 70) {
    return {
      color: "text-cyan-700",
      ring: "border-cyan-400",
      message: "Strong foundation. A few focused practice sessions can push you into elite readiness.",
    };
  }

  if (score >= 45) {
    return {
      color: "text-amber-600",
      ring: "border-yellow-400",
      message: "Good start. Focus on weak areas and complete more full-length interview simulations.",
    };
  }

  return {
    color: "text-red-600",
    ring: "border-red-400",
    message: "Start with one complete interview to build your readiness profile and unlock insights.",
  };
}

export default Dashboard;



