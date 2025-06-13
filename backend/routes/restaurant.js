const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id, type: 'Restaurant' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, address, contactNumber } = req.body;

  if (!name || !email || !password || !address || !contactNumber) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, address, contactNumber');
  }

  const restaurantExists = await Restaurant.findOne({ email });
  if (restaurantExists) {
    res.status(400);
    throw new Error('Restaurant already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const restaurant = await Restaurant.create({
    name,
    email,
    password: hashedPassword,
    address,
    contactNumber,
  });

  if (restaurant) {
    res.status(201).json({
      message: 'Restaurant registered successfully',
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      address: restaurant.address,
      contactNumber: restaurant.contactNumber,
      token: generateToken(restaurant._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid restaurant data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const restaurant = await Restaurant.findOne({ email });

  if (restaurant && (await bcrypt.compare(password, restaurant.password))) {
    res.status(200).json({
      message: 'Login successful',
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      token: generateToken(restaurant._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
}));

router.get('/me', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(404);
    throw new Error('Restaurant not found or not authorized');
  }

  try {
    const restaurantId = req.user._id;

    const [stats, unreadCount] = await Promise.all([
      FoodListing.aggregate([
        { $match: { restaurant: restaurantId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Notification.countDocuments({ recipient: restaurantId, isRead: false })
    ]);

    const listingCounts = { collected: 0, available: 0, expired: 0 };
    stats.forEach(stat => {
      if (stat._id === 'Collected') listingCounts.collected = stat.count;
      if (stat._id === 'Available') listingCounts.available = stat.count;
      if (stat._id === 'Expired') listingCounts.expired = stat.count;
    });

    res.status(200).json({
      ...req.user.toObject(),
      listingCounts: listingCounts,
      unreadNotificationCount: unreadCount
    });

  } catch (error) {
    console.error("Error fetching restaurant details/stats/notifications:", error);
    res.status(500);
    throw new Error('Server error while fetching dashboard data');
  }
}));

module.exports = router;
