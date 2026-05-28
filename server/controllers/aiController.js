const axios = require("axios");

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: `Generate 5 professional interview questions for a ${role}. Return only questions.`,
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

    const questions =
      response.data.choices[0].message.content;

    res.status(200).json({
      questions,
    });

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "AI generation failed",
    });
  }
};

module.exports = { generateInterviewQuestions };

