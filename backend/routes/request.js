const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // Needed for validating ObjectId
const Request = require('../models/Request');
const Food = require('../models/Food');
const PickupSchedule = require('../models/PickupSchedule');
// const { protectNGO } = require('../middleware/authMiddleware'); // TODO: Implement and uncomment

// --- Placeholder Middleware (Remove when actual middleware is implemented) ---
const protectNGO = (req, res, next) => {
  console.log('Placeholder: protectNGO middleware');
  // Simulate attaching user - replace with actual JWT verification logic
  req.user = { id: '60d5ec49e7a1d22f9c1d3e0b', type: 'NGO' }; // Example NGO ID
  next();
};
// --- End Placeholder Middleware ---

const router = express.Router();

// @desc    NGO requests a specific food item
// @route   POST /api/requests/food/:foodId
// @access  Private (NGO Only)
router.post('/food/:foodId', protectNGO, asyncHandler(async (req, res) => {
  const foodId = req.params.foodId;
  const ngoId = req.user.id; // Get NGO ID from authenticated user

  // Validate Food ID
  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    res.status(400);
    throw new Error('Invalid Food ID format');
  }

  // Find the food item
  const foodItem = await Food.findById(foodId);

  if (!foodItem) {
    res.status(404);
    throw new Error('Food item not found');
  }

  // Check if food is available
  if (foodItem.status !== 'Available') {
    res.status(400);
    throw new Error('Food item is no longer available');
  }

  // Check if this NGO already requested this item (optional, prevents duplicate requests)
  const existingRequest = await Request.findOne({ foodId: foodId, ngoId: ngoId });
  if (existingRequest) {
      res.status(400);
      throw new Error('You have already requested this food item.');
  }

  // Create the request
  const newRequest = await Request.create({
    foodId: foodId,
    ngoId: ngoId,
    // requestTime defaults to Date.now()
    // pickupScheduled defaults to false
  });

  // Update the food item status to 'Requested'
  foodItem.status = 'Requested';
  await foodItem.save();

  res.status(201).json(newRequest);
}));

// @desc    Schedule pickup for a requested food item
// @route   POST /api/requests/pickup/schedule/:requestId
// @access  Private (NGO Only)
router.post('/pickup/schedule/:requestId', protectNGO, asyncHandler(async (req, res) => {
  const requestId = req.params.requestId;
  const ngoId = req.user.id;
  const { pickup_date, pickup_time } = req.body;

  // Validate input
  if (!pickup_date || !pickup_time) {
    res.status(400);
    throw new Error('Please provide pickup_date and pickup_time');
  }

  // Validate Request ID
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    res.status(400);
    throw new Error('Invalid Request ID format');
  }

  // Find the request and ensure it belongs to the logged-in NGO
  const foodRequest = await Request.findOne({ _id: requestId, ngoId: ngoId });

  if (!foodRequest) {
    res.status(404);
    throw new Error('Food request not found or does not belong to this NGO');
  }

  // Check if pickup is already scheduled for this request
  if (foodRequest.pickupScheduled) {
    res.status(400);
    throw new Error('Pickup has already been scheduled for this request');
  }

   // Check if a schedule already exists for this request ID (using unique index on PickupSchedule)
  const existingSchedule = await PickupSchedule.findOne({ request_id: requestId });
  if (existingSchedule) {
      res.status(400);
      throw new Error('A pickup schedule already exists for this request ID.');
  }

  // TODO: Optional - Check if the associated Food item status is appropriate (e.g., 'Requested', not 'Picked' or 'Available')

  // Create the pickup schedule
  const newSchedule = await PickupSchedule.create({
    request_id: requestId,
    pickup_date,
    pickup_time,
    // scheduled_on defaults to Date.now()
  });

  // Update the request status to indicate pickup is scheduled
  foodRequest.pickupScheduled = true;
  await foodRequest.save();

  // TODO: Optional - Update the associated Food item status to 'Picked'? Or handle this on actual pickup confirmation?
  // const foodItem = await Food.findById(foodRequest.foodId);
  // if (foodItem) {
  //   foodItem.status = 'Picked';
  //   await foodItem.save();
  // }

  res.status(201).json(newSchedule);
}));

module.exports = router; 