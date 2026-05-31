import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";

function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/analytics"
      );

      setAnalytics(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-10 overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Total Interviews
            </h2>

            <p className="text-5xl font-bold text-cyan-400 mt-4">
              {analytics.totalInterviews}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Average Score
            </h2>

            <p className="text-5xl font-bold text-green-400 mt-4">
              {analytics.averageScore}%
            </p>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-8">
            Performance Trend
          </h2>

          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <LineChart
              data={analytics.chartData}
            >
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

        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Recent Interviews
          </h2>

          <div className="space-y-5">
            {analytics.recentInterviews.map(
              (item, index) => (
                <div
                  key={index}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400">
                      {item.role}
                    </h3>

                    <p className="text-slate-400">
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-3xl font-bold text-green-400">
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