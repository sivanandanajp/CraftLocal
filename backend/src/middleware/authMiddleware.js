
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({
      message: 'Not authorized, no token provided',
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured in .env');

    return res.status(500).json({
      message: 'Authentication is not configured',
    });
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        message: 'Not authorized, user no longer exists',
      });
    }

    return next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired token',
      });
    }

    console.error('Authentication error:', error);

    return res.status(500).json({
      message: 'Authentication failed',
    });
  }
};

module.exports = { protect };
