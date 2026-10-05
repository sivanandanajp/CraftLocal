const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this points to your User model
const { protect } = require('../middleware/authMiddleware'); // Middleware to check JWT token

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/users/role
// @desc    Update user role (e.g. Upgrade from buyer to seller)
// @access  Private
router.patch('/role', protect, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ message: 'Invalid or missing role' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error while updating role' });
  }
});

module.exports = router;