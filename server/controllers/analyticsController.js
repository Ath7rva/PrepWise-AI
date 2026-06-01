const Interview = require("../models/Interview");
const Session = require("../models/Session");

const skillFields = [
  ["technicalScore", "Technical"],
  ["communicationScore", "Communication"],
  ["confidenceScore", "Confidence"],
  ["problemSolvingScore", "Problem Solving"],
];

const getAverage = (items, field) => {
  if (!items.length) return 0;

  return Math.round(
    items.reduce((sum, item) => sum + (item[field] || 0), 0) / items.length
  );
};

const getWeakArea = (items) => {
  if (!items.length) {
    return {
      key: "",
      label: "Not enough data",
      value: 0,
    };
  }

  const averages = skillFields.map(([key, label]) => ({
    key,
    label,
    value: getAverage(items, key),
  }));

  return averages.sort((a, b) => a.value - b.value)[0];
};

const getAnalytics = async (req, res) => {
  try {
    let sessions = await Session.find({ user: req.user }).sort({ createdAt: 1 });

    if (!sessions.length) {
      const legacyInterviews = await Interview.find({ user: req.user }).sort({
        createdAt: 1,
      });

      sessions = legacyInterviews.map((item) => ({
        _id: item._id,
        role: item.role,
        score: item.score || 0,
        technicalScore: item.technicalScore || 0,
        communicationScore: item.communicationScore || 0,
        confidenceScore: item.confidenceScore || 0,
        problemSolvingScore: item.problemSolvingScore || 0,
        createdAt: item.createdAt,
        questions: [
          {
            question: item.question,
            answer: item.answer,
            feedback: item.feedback,
            score: item.score || 0,
          },
        ],
      }));
    }

    const totalInterviews = sessions.length;
    const averageScore = getAverage(sessions, "score");

    const chartData = sessions.map((item, index) => ({
      name: `Session ${index + 1}`,
      score: item.score || 0,
      technical: item.technicalScore || 0,
      communication: item.communicationScore || 0,
      confidence: item.confidenceScore || 0,
      problemSolving: item.problemSolvingScore || 0,
    }));

    const skillTrends = skillFields.map(([key, label]) => ({
      key,
      label,
      average: getAverage(sessions, key),
      data: sessions.map((item, index) => ({
        name: `Session ${index + 1}`,
        score: item[key] || 0,
      })),
    }));

    const recentInterviews = [...sessions]
      .slice(-5)
      .reverse()
      .map((item) => ({
        id: item._id,
        role: item.role,
        score: item.score || 0,
        date: item.createdAt,
        questionCount: item.questions?.length || 0,
        targetedSkill: item.targetedSkill || "",
      }));

    const weakArea = getWeakArea(sessions);

    res.status(200).json({
      totalInterviews,
      averageScore,
      chartData,
      recentInterviews,
      skillTrends,
      weakArea,
      sessionReports: recentInterviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};

module.exports = {
  getAnalytics,
};
