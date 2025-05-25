const express = require('express');
const asyncHandler = require('express-async-handler');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant'); // Needed for populating
// const { protectRestaurant, protectNGO } = require('../middleware/authMiddleware'); // TODO: Implement and uncomment this

// --- Placeholder Middleware (Remove when actual middleware is implemented) ---
const protectRestaurant = (req, res, next) => {
  console.log('Placeholder: protectRestaurant middleware');
  // Simulate attaching user - replace with actual JWT verification logic
  req.user = { id: '60d5ec49e7a1d22f9c1d3e0a', type: 'Restaurant' }; // Example Restaurant ID
  next();
};
const protectNGO = (req, res, next) => {
  console.log('Placeholder: protectNGO middleware');
  // Simulate attaching user - replace with actual JWT verification logic
  req.user = { id: '60d5ec49e7a1d22f9c1d3e0b', type: 'NGO' }; // Example NGO ID
  next();
};
// --- End Placeholder Middleware ---

const router = express.Router();

// @desc    Add new surplus food listing
// @route   POST /api/food/add
// @access  Private (Restaurant Only)
router.post('/add', protectRestaurant, asyncHandler(async (req, res) => {
  const {
    foodName,
    quantity,
    pickupAddress,
    expiryTime
  } = req.body;

  // Basic validation
  if (!foodName || !quantity || !pickupAddress || !expiryTime) {
    res.status(400);
    throw new Error('Please provide all required fields: foodName, quantity, pickupAddress, expiryTime');
  }

  const food = new Food({
    restaurantId: req.user.id, // Get ID from authenticated user
    foodName,
    quantity,
    pickupAddress,
    expiryTime,
    // status defaults to 'Available' as per schema
  });

  const createdFood = await food.save();
  res.status(201).json(createdFood);
}));

// @desc    Get all available food listings
// @route   GET /api/food/all
// @access  Private (NGO Only)
router.get('/all', protectNGO, asyncHandler(async (req, res) => {
  const availableFood = await Food.find({ status: 'Available' })
    .populate('restaurantId', 'name contactNumber') // Populate with restaurant name and contact number
    .sort({ createdAt: -1 }); // Sort by newest first

  res.json(availableFood);
}));

module.exports = router; 