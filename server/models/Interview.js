const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
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

    technicalScore: {
  type: Number,
},

communicationScore: {
  type: Number,
},

confidenceScore: {
  type: Number,
},

problemSolvingScore: {
  type: Number,
},

strengths: [
  {
    type: String,
  },
],

weaknesses: [
  {
    type: String,
  },
],

improvements: [
  {
    type: String,
  },
],

betterAnswer: {
  type: String,
},


  },
  { timestamps: true }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

module.exports = Interview;

