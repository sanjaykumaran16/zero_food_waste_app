const express = require('express');
const asyncHandler = require('express-async-handler');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  const {
    foodName,
    quantity,
    pickupAddress,
    expiryTime
  } = req.body;

  if (!foodName || !quantity || !pickupAddress || !expiryTime) {
    res.status(400);
    throw new Error('Please provide all required fields: foodName, quantity, pickupAddress, expiryTime');
  }

  const food = new Food({
    restaurantId: req.user.id,
    foodName,
    quantity,
    pickupAddress,
    expiryTime,
  });

  const createdFood = await food.save();
  res.status(201).json(createdFood);
}));

router.get('/all', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  const availableFood = await Food.find({ status: 'Available' })
    .populate('restaurantId', 'name contactNumber')
    .sort({ createdAt: -1 });

  res.json(availableFood);
}));

module.exports = router;
