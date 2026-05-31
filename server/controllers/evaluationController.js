const axios = require("axios");
const Interview = require("../models/Interview");

const evaluateAnswer = async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!role || !question || !answer) {
      return res.status(400).json({
        message: "Role, question, and answer are required",
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: `
You are an expert technical interviewer.

Evaluate this interview answer for the role of ${role}.

Question:
${question}

Candidate Answer:
${answer}

Return ONLY valid JSON in this exact format:
{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "problemSolvingScore": 0,
  "feedback": "Detailed feedback here",
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"]
}

Scores must be numbers from 0 to 100.
Do not include markdown.
Do not include extra text.
`,
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

    let aiText = response.data.choices[0].message.content;

    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(aiText);

    const interview = await Interview.create({
      role,
      question,
      answer,
      feedback: parsed.feedback,
      score: parsed.overallScore,
      technicalScore: parsed.technicalScore,
      communicationScore: parsed.communicationScore,
      confidenceScore: parsed.confidenceScore,
      problemSolvingScore: parsed.problemSolvingScore,
    });

    res.status(200).json({
      feedback: parsed.feedback,
      scores: {
        overall: parsed.overallScore,
        technical: parsed.technicalScore,
        communication: parsed.communicationScore,
        confidence: parsed.confidenceScore,
        problemSolving: parsed.problemSolvingScore,
      },
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      improvements: parsed.improvements,
      interview,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Evaluation failed",
    });
  }
};

module.exports = {
  evaluateAnswer,
};