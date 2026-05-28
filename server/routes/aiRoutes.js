const express = require("express");

const {
  generateInterviewQuestions,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/generate", generateInterviewQuestions);

module.exports = router;

