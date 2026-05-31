const axios = require("axios");

const generateRoadmap = async (req, res) => {
  try {
    const { role, questions, answers, feedbacks } = req.body;

    if (!role || !questions || !answers || !feedbacks) {
      return res.status(400).json({
        message: "Role, questions, answers, and feedbacks are required",
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
You are an expert career coach and technical interviewer.

Create a personalized improvement roadmap for this candidate.

Target Role:
${role}

Interview Questions:
${JSON.stringify(questions, null, 2)}

Candidate Answers:
${JSON.stringify(answers, null, 2)}

AI Feedback:
${JSON.stringify(feedbacks, null, 2)}

Return a clear improvement roadmap with:
1. Weak areas
2. Strong areas
3. 7-day improvement plan
4. Topics to revise
5. Practical project suggestions
6. Interview tips

Keep it professional and structured.
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

    const roadmap = response.data.choices[0].message.content;

    res.status(200).json({
      roadmap,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Roadmap generation failed",
    });
  }
};

module.exports = {
  generateRoadmap,
};