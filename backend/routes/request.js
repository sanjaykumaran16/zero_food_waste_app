const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Food = require('../models/Food');
const PickupSchedule = require('../models/PickupSchedule');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/food/:foodId', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  const foodId = req.params.foodId;
  const ngoId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(foodId)) {
    res.status(400);
    throw new Error('Invalid Food ID format');
  }

  const foodItem = await Food.findById(foodId);

  if (!foodItem) {
    res.status(404);
    throw new Error('Food item not found');
  }

  if (foodItem.status !== 'Available') {
    res.status(400);
    throw new Error('Food item is no longer available');
  }

  const existingRequest = await Request.findOne({ foodId: foodId, ngoId: ngoId });
  if (existingRequest) {
    res.status(400);
    throw new Error('You have already requested this food item.');
  }

  const newRequest = await Request.create({
    foodId: foodId,
    ngoId: ngoId,
  });

  foodItem.status = 'Requested';
  await foodItem.save();

  res.status(201).json(newRequest);
}));

router.post('/pickup/schedule/:requestId', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  const requestId = req.params.requestId;
  const ngoId = req.user.id;
  const { pickup_date, pickup_time } = req.body;

  if (!pickup_date || !pickup_time) {
    res.status(400);
    throw new Error('Please provide pickup_date and pickup_time');
  }

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    res.status(400);
    throw new Error('Invalid Request ID format');
  }

  const foodRequest = await Request.findOne({ _id: requestId, ngoId: ngoId });

  if (!foodRequest) {
    res.status(404);
    throw new Error('Food request not found or does not belong to this NGO');
  }

  if (foodRequest.pickupScheduled) {
    res.status(400);
    throw new Error('Pickup has already been scheduled for this request');
  }

  const existingSchedule = await PickupSchedule.findOne({ request_id: requestId });
  if (existingSchedule) {
    res.status(400);
    throw new Error('A pickup schedule already exists for this request ID.');
  }

  const newSchedule = await PickupSchedule.create({
    request_id: requestId,
    pickup_date,
    pickup_time,
  });

  foodRequest.pickupScheduled = true;
  await foodRequest.save();

  res.status(201).json(newSchedule);
}));

module.exports = router;
