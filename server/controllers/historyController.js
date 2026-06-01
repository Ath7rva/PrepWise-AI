const Interview = require("../models/Interview");
const Session = require("../models/Session");

const toLegacySession = (item) => ({
  _id: item._id,
  role: item.role,
  score: item.score || 0,
  technicalScore: item.technicalScore || 0,
  communicationScore: item.communicationScore || 0,
  confidenceScore: item.confidenceScore || 0,
  problemSolvingScore: item.problemSolvingScore || 0,
  feedback: item.feedback || "",
  strengths: item.strengths || [],
  weaknesses: item.weaknesses || [],
  improvements: item.improvements || [],
  question: item.question,
  answer: item.answer,
  questions: [
    {
      question: item.question,
      answer: item.answer,
      feedback: item.feedback || "",
      score: item.score || 0,
      strengths: item.strengths || [],
      weaknesses: item.weaknesses || [],
      improvements: item.improvements || [],
      betterAnswer: item.betterAnswer || "",
    },
  ],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user }).sort({
      createdAt: -1,
    });

    if (sessions.length) {
      return res.status(200).json(sessions);
    }

    const interviews = await Interview.find({ user: req.user }).sort({
      createdAt: -1,
    });

    res.status(200).json(interviews.map(toLegacySession));
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
};

const deleteInterviewHistory = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (session) {
      await Interview.deleteMany({
        session: session._id,
        user: req.user,
      });

      return res.status(200).json({ message: "Session deleted" });
    }

    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!interview) {
      return res.status(404).json({ message: "History item not found" });
    }

    res.status(200).json({ message: "Interview deleted" });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete history item",
    });
  }
};

module.exports = {
  getInterviewHistory,
  deleteInterviewHistory,
};
