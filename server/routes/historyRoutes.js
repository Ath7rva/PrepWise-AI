const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const {
  getInterviewHistory,
  deleteInterviewHistory,
} = require("../controllers/historyController");

router.get("/", protect, getInterviewHistory);
router.delete("/:id", protect, deleteInterviewHistory);

module.exports = router;

