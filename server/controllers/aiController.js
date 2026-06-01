const axios = require("axios");
const Session = require("../models/Session");

const skillLabels = {
  technicalScore: "technical depth",
  communicationScore: "communication clarity",
  confidenceScore: "confidence and structure",
  problemSolvingScore: "problem solving",
};

const getWeakArea = async (userId) => {
  const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 });

  if (!sessions.length) return "";

  const averages = Object.keys(skillLabels).map((key) => ({
    key,
    value: Math.round(
      sessions.reduce((sum, session) => sum + (session[key] || 0), 0) /
        sessions.length
    ),
  }));

  const weakest = averages.sort((a, b) => a.value - b.value)[0];

  return skillLabels[weakest.key] || "";
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const {
      role,
      difficulty = "Intermediate",
      experienceLevel = "",
      techStack = "",
      company = "",
      jobDescription = "",
      resumeText = "",
      practiceMode = "standard",
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const weakArea =
      practiceMode === "weak-area" ? await getWeakArea(req.user) : "";

    const prompt = `
Generate 5 realistic professional interview questions.

Candidate target role: ${role}
Difficulty: ${difficulty}
Experience level: ${experienceLevel || "Not specified"}
Tech stack: ${techStack || "Not specified"}
Company target: ${company || "Not specified"}
Practice mode: ${practiceMode}
Weak area to target: ${weakArea || "None"}

Job description:
${jobDescription || "Not provided"}

Resume context:
${resumeText || "Not provided"}

Rules:
- Return ONLY a JSON array of strings.
- Questions should be specific and interview-ready.
- If resume or job description context is provided, ask about those details.
- If weak area is provided, make at least 3 questions target that skill.
- Do not include markdown or numbering.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions;

    try {
      questions = JSON.parse(content);
    } catch (error) {
      questions = content
        .split("\n")
        .map((q) => q.replace(/^\d+[\).]\s*/, "").trim())
        .filter(Boolean);
    }

    res.status(200).json({
      questions,
      targetedSkill: weakArea,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "AI generation failed",
    });
  }
};

module.exports = { generateInterviewQuestions };
