
const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  evaluateAnswer,
  evaluateSession,
} = require("../controllers/evaluationController");

router.post("/evaluate", protect, evaluateAnswer);
router.post("/session", protect, evaluateSession);

module.exports = router;

