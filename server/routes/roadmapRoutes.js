const express = require("express");
const { generateRoadmap } = require("../controllers/roadmapController");

const router = express.Router();

router.post("/generate", generateRoadmap);

module.exports = router;