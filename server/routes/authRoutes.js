const { protect } = require("../middleware/authMiddleware"); 
const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

//Protected Route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route accessed",
    userId: req.user,
  });
});

module.exports = router;
 
