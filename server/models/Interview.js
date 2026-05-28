const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    role: {
      type: String,
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    feedback: {
      type: String,
    },

    score: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

module.exports = Interview;

