
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check whether the Authorization header contains a Bearer token.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Not authorized, no token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token provided.',
    });
  }

  // Require the JWT secret from the environment.
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is not configured.');

    return res.status(500).json({
      message: 'Server authentication is not configured.',
    });
  }

  try {
    // Verify the token signature and expiration.
    const decoded = jwt.verify(token, secret);

    // Retrieve the user without exposing their password.
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        message: 'User authorization failed: User no longer exists.',
      });
    }

    return next();
  } catch (error) {
    // Invalid, expired, or malformed tokens are unauthorized.
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Not authorized, token validation failed.',
      });
    }

    console.error('JWT authentication error:', error);

    return res.status(500).json({
      message: 'Unable to authenticate the request.',
    });
  }
};

module.exports = { protect };
