
const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get current user profile
router.get('/profile', protect, getUserProfile);

// Update user profile or saved addresses
router.put('/profile', protect, updateUserProfile);

module.exports = router;
