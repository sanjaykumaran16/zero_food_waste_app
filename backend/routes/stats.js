const express = require('express');
const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const NGO = require('../models/Ngo');
const FoodListing = require('../models/FoodListing');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  try {
    const restaurantCount = await Restaurant.countDocuments();
    const ngoCount = await NGO.countDocuments();
    const donationsCollectedCount = await FoodListing.countDocuments({ status: 'Collected' });

    res.status(200).json({
      restaurants: restaurantCount,
      ngos: ngoCount,
      donations: donationsCollectedCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500);
    throw new Error('Server error while fetching statistics');
  }
}));

module.exports = router;
