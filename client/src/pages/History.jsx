import { useEffect, useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

function History() {
  const [interviews, setInterviews] =
    useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        "https://prepwise-ai-backend-a16j.onrender.com/api/history"
      );

      setInterviews(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

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
            Interview History
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Review your past AI interview sessions.
          </p>
        </motion.div>

        {/* History Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {interviews.map((item) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={item._id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                {item.role}
              </h2>

              <p className="text-slate-300 mb-4">
                <span className="font-bold">
                  Question:
                </span>{" "}
                {item.question}
              </p>

              <p className="text-slate-300 mb-4">
                <span className="font-bold">
                  Answer:
                </span>{" "}
                {item.answer}
              </p>

              <div className="flex justify-between items-center mt-6">
                <div>
                  <p className="text-slate-400">
                    AI Score
                  </p>

                  <p className="text-3xl font-bold text-green-400">
                    {item.score}%
                  </p>
                </div>

                <div className="text-slate-500 text-sm">
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;

