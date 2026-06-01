import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";
import { API_URL } from "../config/api";

function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  async function fetchAnalytics() {
    try {
      const res = await axios.get(
        `${API_URL}/api/analytics`
      );

      setAnalytics(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, []);

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-slate-950 flex items-center justify-center text-2xl">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f4f7fb] text-slate-950 p-10 overflow-hidden">

      {/* Glow */}
      <div className="relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Track your interview performance.
          </p>
        </motion.div>

        {/* Stats   s */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Total Interviews
            </h2>

            <p className="text-5xl font-bold text-cyan-700 mt-4">
              {analytics.totalInterviews}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Average Score
            </h2>

            <p className="text-5xl font-bold text-emerald-700 mt-4">
              {analytics.averageScore}%
            </p>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-8">
            Performance Trend
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {(analytics.skillTrends || []).map((skill) => (
            <motion.div
              key={skill.key}
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-6"
            >
              <p className="text-slate-400">{skill.label}</p>
              <p className="text-4xl font-black text-cyan-700 mt-2">
                {skill.average}%
              </p>
              <div className="h-28 mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skill.data}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>

        {analytics.weakArea?.label && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-8 mb-12"
          >
            <h2 className="text-3xl font-bold text-amber-700 mb-3">
              Recommended Focus
            </h2>
            <p className="text-slate-600 text-lg">
              Your lowest skill trend is {analytics.weakArea.label} at{" "}
              {analytics.weakArea.value}%. Start a weak-area interview to target
              this directly.
            </p>
          </motion.div>
        )}

        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white border border-slate-200 rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Recent Interviews
          </h2>

          <div className="space-y-5">
            {(analytics.sessionReports || analytics.recentInterviews).map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-700">
                      {item.role}
                    </h3>

                    <p className="text-slate-400">
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {item.questionCount || 0} questions
                      {item.targetedSkill ? ` - ${item.targetedSkill}` : ""}
                    </p>
                  </div>

                  <div className="text-3xl font-bold text-emerald-700">
                    {item.score}%
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;



