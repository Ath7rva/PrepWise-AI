const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
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
      default: "",
    },
    score: {
      type: Number,
      default: 0,
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
      default: "",
    },
  },
  { _id: false }
);

const proctorPhotoSchema = new mongoose.Schema(
  {
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    dataUrl: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const proctorVideoSchema = new mongoose.Schema(
  {
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    durationSeconds: {
      type: Number,
      default: 30,
    },
    mimeType: {
      type: String,
      default: "video/webm",
    },
    dataUrl: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: "Intermediate",
    },
    experienceLevel: {
      type: String,
      default: "",
    },
    techStack: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    jobDescription: {
      type: String,
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
    },
    practiceMode: {
      type: String,
      default: "standard",
    },
    targetedSkill: {
      type: String,
      default: "",
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    questions: [answerSchema],
    feedback: {
      type: String,
      default: "",
    },
    score: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    problemSolvingScore: {
      type: Number,
      default: 0,
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
    nextPracticePlan: [
      {
        type: String,
      },
    ],
    proctoringMedia: {
      capturedAt: {
        type: Date,
        default: Date.now,
      },
      photoCount: {
        type: Number,
        default: 0,
      },
      photos: [proctorPhotoSchema],
      video: {
        type: proctorVideoSchema,
        default: null,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
