import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";

const data = [
  {
    day: "Mon",
    score: 65,
  },
  {
    day: "Tue",
    score: 72,
  },
  {
    day: "Wed",
    score: 80,
  },
  {
    day: "Thu",
    score: 76,
  },
  {
    day: "Fri",
    score: 89,
  },
];

function Analytics() {
  return (
    <div className="min-h-screen bg-black text-white p-10">

      {/* Background Glow */}
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
            Track your AI interview performance and growth.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Total Interviews
            </h2>

            <p className="text-5xl font-bold text-cyan-400 mt-4">
              24
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Average Score
            </h2>

            <p className="text-5xl font-bold text-green-400 mt-4">
              82%
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-slate-400 text-lg">
              Improvement Rate
            </h2>

            <p className="text-5xl font-bold text-purple-400 mt-4">
              +18%
            </p>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-3xl font-bold mb-8">
            Performance Trend
          </h2>

          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <LineChart data={data}>
              <XAxis dataKey="day" />

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
      </div>
    </div>
  );
}

export default Analytics;
