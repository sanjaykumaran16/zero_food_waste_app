const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant'); // Assuming Restaurant model path
const NGO = require('../models/Ngo'); // Assuming NGO model path

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in your .env

      // Attempt to find user as Restaurant OR NGO based on token payload
      // Assumes your JWT payload has an 'id' and a 'type' ('restaurant' or 'ngo')
      if (decoded.type === 'Restaurant') {
          req.user = await Restaurant.findById(decoded.id).select('-password'); // Get user without password
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

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401); // Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to restrict access to specific user types
const restrictTo = (...types) => {
  return (req, res, next) => {
    if (!req.userType || !types.includes(req.userType)) {
      res.status(403); // Forbidden
      return next(new Error('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { protect, restrictTo }; 