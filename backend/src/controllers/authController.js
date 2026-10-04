const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate signed JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'craftlocal_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, fullName, email, password, role, longitude, latitude } = req.body;

    // Accept either 'name' or 'fullName' from frontend
    const userName = name || fullName;

    // 1. Basic field validation
    if (!userName || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with this email address' 
      });
    }

    // 3. Fallback coordinates [0, 0] if omitted
    const parsedLng = !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 0;
    const parsedLat = !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 0;

    // 4. Build user data payload
    const userData = {
      name: userName,
      email: email.toLowerCase(),
      password,
      role: role ? role.toLowerCase() : 'buyer',
    };

    // Safely attach location only if coordinates exist or schema expects it
    if (longitude !== undefined || latitude !== undefined) {
      userData.location = {
        type: 'Point',
        coordinates: [parsedLng, parsedLat],
      };
    }

    // 5. Create user record
    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error during registration' 
    });
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Verify user exists and check password hash match
    if (user && (await user.matchPassword(password))) {
      res.json({
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
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile & addresses
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar || user.avatar;
    user.phone = req.body.phone || user.phone;

    if (req.body.savedAddresses) {
      user.savedAddresses = req.body.savedAddresses;
    }

    // Safely parse and update geo coordinates if provided
    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      const parsedLng = parseFloat(req.body.longitude);
      const parsedLat = parseFloat(req.body.latitude);
      if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
        user.location = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
        };
      }
    }

    const updatedUser = await user.save();

    res.json({
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
    console.error('Update Profile Backend Error:', error);
    res.status(500).json({ message: error.message || 'Failed to update user profile' });
  }
};

// Export both naming conventions to avoid routing crashes
module.exports = {
  register: registerUser,
  registerUser,
  login: loginUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};