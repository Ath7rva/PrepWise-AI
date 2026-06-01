const axios = require("axios");
const Interview = require("../models/Interview");
const Session = require("../models/Session");

const callAi = async (prompt) => {
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

  return response.data.choices[0].message.content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

const evaluateAnswer = async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!role || !question || !answer) {
      return res.status(400).json({
        message: "Role, question, and answer are required",
      });
    }

    const aiText = await callAi(`
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
  "improvements": ["point 1", "point 2"],
  "betterAnswer": "A stronger sample answer"
}

Scores must be numbers from 0 to 100.
Do not include markdown.
Do not include extra text.
`);

    const parsed = JSON.parse(aiText);

    const interview = await Interview.create({
      user: req.user,
      role,
      question,
      answer,
      feedback: parsed.feedback,
      score: parsed.overallScore,
      technicalScore: parsed.technicalScore,
      communicationScore: parsed.communicationScore,
      confidenceScore: parsed.confidenceScore,
      problemSolvingScore: parsed.problemSolvingScore,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      improvements: parsed.improvements,
      betterAnswer: parsed.betterAnswer,
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
      betterAnswer: parsed.betterAnswer,
      interview,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Evaluation failed",
    });
  }
};

const evaluateSession = async (req, res) => {
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
      targetedSkill = "",
      questions = [],
      answers = {},
      durationSeconds = 0,
      warningCount = 0,
    } = req.body;

    if (!role || !questions.length) {
      return res.status(400).json({
        message: "Role and questions are required",
      });
    }

    const qaText = questions
      .map(
        (question, index) => `
Question ${index + 1}: ${question}
Answer ${index + 1}: ${answers[question] || ""}`
      )
      .join("\n");

    const aiText = await callAi(`
You are an expert technical interviewer and career coach.

Evaluate this complete mock interview.

Role: ${role}
Difficulty: ${difficulty}
Experience level: ${experienceLevel || "Not specified"}
Tech stack: ${techStack || "Not specified"}
Company: ${company || "Not specified"}
Practice mode: ${practiceMode}
Targeted weak skill: ${targetedSkill || "None"}

Job description:
${jobDescription || "Not provided"}

Resume context:
${resumeText || "Not provided"}

Interview transcript:
${qaText}

Return ONLY valid JSON in this exact format:
{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "problemSolvingScore": 0,
  "feedback": "Overall session summary",
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "nextPracticePlan": ["step 1", "step 2", "step 3"],
  "questionFeedback": [
    {
      "question": "exact question text",
      "score": 0,
      "feedback": "question-specific feedback",
      "strengths": ["point 1"],
      "weaknesses": ["point 1"],
      "improvements": ["point 1"],
      "betterAnswer": "A stronger sample answer"
    }
  ]
}

Scores must be numbers from 0 to 100.
Include one questionFeedback item per interview question.
Do not include markdown.
Do not include extra text.
`);

    const parsed = JSON.parse(aiText);
    const feedbackByQuestion = new Map(
      (parsed.questionFeedback || []).map((item) => [item.question, item])
    );

    const sessionQuestions = questions.map((question) => {
      const feedback = feedbackByQuestion.get(question) || {};

      return {
        question,
        answer: answers[question] || "",
        feedback: feedback.feedback || "",
        score: feedback.score || 0,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        improvements: feedback.improvements || [],
        betterAnswer: feedback.betterAnswer || "",
      };
    });

    const session = await Session.create({
      user: req.user,
      role,
      difficulty,
      experienceLevel,
      techStack,
      company,
      jobDescription,
      resumeText,
      practiceMode,
      targetedSkill,
      durationSeconds,
      warningCount,
      questions: sessionQuestions,
      feedback: parsed.feedback,
      score: parsed.overallScore,
      technicalScore: parsed.technicalScore,
      communicationScore: parsed.communicationScore,
      confidenceScore: parsed.confidenceScore,
      problemSolvingScore: parsed.problemSolvingScore,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      improvements: parsed.improvements || [],
      nextPracticePlan: parsed.nextPracticePlan || [],
    });

    await Interview.insertMany(
      sessionQuestions.map((item) => ({
        user: req.user,
        session: session._id,
        role,
        question: item.question,
        answer: item.answer,
        feedback: item.feedback,
        score: item.score || parsed.overallScore,
        technicalScore: parsed.technicalScore,
        communicationScore: parsed.communicationScore,
        confidenceScore: parsed.confidenceScore,
        problemSolvingScore: parsed.problemSolvingScore,
        strengths: item.strengths,
        weaknesses: item.weaknesses,
        improvements: item.improvements,
        betterAnswer: item.betterAnswer,
      }))
    );

    res.status(200).json({
      feedback: parsed.feedback,
      scores: {
        overall: parsed.overallScore,
        technical: parsed.technicalScore,
        communication: parsed.communicationScore,
        confidence: parsed.confidenceScore,
        problemSolving: parsed.problemSolvingScore,
      },
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      improvements: parsed.improvements || [],
      nextPracticePlan: parsed.nextPracticePlan || [],
      questionFeedback: sessionQuestions,
      session,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Session evaluation failed",
    });
  }
};

module.exports = {
  evaluateAnswer,
  evaluateSession,
};
