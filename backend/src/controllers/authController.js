
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in .env');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, fullName, email, password, role, longitude, latitude } = req.body;
    const userName = name || fullName;

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    const normalizedRole = (role || 'buyer').toLowerCase();

    if (!['buyer', 'creator'].includes(normalizedRole)) {
      return res.status(400).json({
        message: 'Role must be buyer or creator',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({
        message: 'User already exists with this email address',
      });
    }

    const userData = {
      name: userName.trim(),
      email: normalizedEmail,
      password,
      role: normalizedRole,
    };

    if (longitude !== undefined && latitude !== undefined) {
      const lng = Number(longitude);
      const lat = Number(latitude);

      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        lng >= -180 && lng <= 180 &&
        lat >= -90 && lat <= 90
      ) {
        userData.location = {
          type: 'Point',
          coordinates: [lng, lat],
        };
      }
    }

    const user = await User.create(userData);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration Error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'User already exists with this email address',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: error.message || 'Server error during registration',
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      phone: user.phone,
      savedAddresses: user.savedAddresses,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update user profile and saved addresses
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    if (req.body.savedAddresses !== undefined) {
      user.savedAddresses = req.body.savedAddresses;
    }

    if (
      req.body.longitude !== undefined &&
      req.body.latitude !== undefined
    ) {
      const lng = Number(req.body.longitude);
      const lat = Number(req.body.latitude);

      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        lng >= -180 && lng <= 180 &&
        lat >= -90 && lat <= 90
      ) {
        user.location = {
          type: 'Point',
          coordinates: [lng, lat],
        };
      }
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      savedAddresses: updatedUser.savedAddresses,
      location: updatedUser.location,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: error.message || 'Failed to update user profile',
    });
  }
};

module.exports = {
  register: registerUser,
  registerUser,
  login: loginUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
