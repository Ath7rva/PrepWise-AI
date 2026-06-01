const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  generateInterviewQuestions,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/generate", protect, generateInterviewQuestions);

module.exports = router;

