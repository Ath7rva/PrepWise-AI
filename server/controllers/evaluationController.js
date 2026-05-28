const axios = require("axios");

const Interview = require("../models/Interview");

const evaluateAnswer = async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",

        messages: [
          {
            role: "user",

            content: `
You are an expert technical interviewer.

Evaluate this interview answer professionally.

Role:
${role}

Question:
${question}

Answer:
${answer}

Give:
1. Score out of 100
2. Strengths
3. Weaknesses
4. Improvement suggestions

Format response EXACTLY like this:

Score: XX

Strengths:
- point
- point

Weaknesses:
- point
- point

Improvements:
- point
- point
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

    const feedback =
      response.data.choices[0].message.content;

    // Save to database
    const interview = await Interview.create({
      role,
      question,
      answer,
      feedback,
      score: 80,
    });

    res.status(200).json({
      feedback,
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

