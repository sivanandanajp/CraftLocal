const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user (Buyer or Creator)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT Token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @desc    Get user profile details
// @access  Private (Requires token)
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile or saved addresses
// @access  Private (Requires token)
router.put('/profile', protect, updateUserProfile);

module.exports = router;