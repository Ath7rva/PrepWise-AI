const Interview = require("../models/Interview");

const getAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: 1 });

    const totalInterviews = interviews.length;

    const averageScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce((sum, item) => sum + (item.score || 0), 0) /
              totalInterviews
          )
        : 0;

    const chartData = interviews.map((item, index) => ({
      name: `Interview ${index + 1}`,
      score: item.score || 0,
    }));

    const recentInterviews = interviews
      .slice(-5)
      .reverse()
      .map((item) => ({
        role: item.role,
        score: item.score || 0,
        date: item.createdAt,
      }));

    res.status(200).json({
      totalInterviews,
      averageScore,
      chartData,
      recentInterviews,
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