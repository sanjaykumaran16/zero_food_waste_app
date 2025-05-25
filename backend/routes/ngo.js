const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const NGO = require('../models/Ngo'); // Correct model name is Ngo.js

// Import middleware
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Function to generate JWT for NGO
const generateToken = (id) => {
  // Include type: 'ngo' in the payload
  return jwt.sign({ id, type: 'ngo' }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new NGO
// @route   POST /api/ngos/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, address, contactNumber } = req.body;

  // Basic validation
  if (!name || !email || !password || !address || !contactNumber) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, address, contactNumber');
  }

  // Check if NGO already exists
  const ngoExists = await NGO.findOne({ email });
  if (ngoExists) {
    res.status(400);
    throw new Error('NGO already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create NGO
  const ngo = await NGO.create({
    name,
    email,
    password: hashedPassword,
    address,
    contactNumber,
  });

  if (ngo) {
    // Return created user data and token (excluding password)
    res.status(201).json({
      message: 'NGO registered successfully',
      _id: ngo._id,
      name: ngo.name,
      email: ngo.email,
      address: ngo.address,
      contactNumber: ngo.contactNumber,
      token: generateToken(ngo._id), // Generate token for the new NGO
    });
  } else {
    res.status(400);
    throw new Error('Invalid NGO data');
  }
}));

// @desc    Authenticate NGO & get token
// @route   POST /api/ngos/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for NGO email
  const ngo = await NGO.findOne({ email });

  // Check if NGO exists and password matches
  if (ngo && (await bcrypt.compare(password, ngo.password))) {
    // Return user data and token
    res.status(200).json({
      message: 'Login successful',
      _id: ngo._id,
      name: ngo.name,
      email: ngo.email,
      token: generateToken(ngo._id), // Generate token
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
}));

// @desc    Get logged-in NGO details
// @route   GET /api/ngos/me
// @access  Private (NGO Only)
router.get('/me', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  // req.user should be attached by the protect middleware
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404);
    throw new Error('NGO not found or not authorized');
  }
}));

module.exports = router;
