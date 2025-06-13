const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const NGO = require('../models/Ngo');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type === 'Restaurant') {
        req.user = await Restaurant.findById(decoded.id).select('-password');
        req.userType = 'restaurant';
      } else if (decoded.type === 'ngo') {
        req.user = await NGO.findById(decoded.id).select('-password');
        req.userType = 'ngo';
      } else {
        throw new Error('Invalid token type');
      }

      if (!req.user) {
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const restrictTo = (...types) => {
  return (req, res, next) => {
    if (!req.userType || !types.includes(req.userType)) {
      res.status(403);
      return next(new Error('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
