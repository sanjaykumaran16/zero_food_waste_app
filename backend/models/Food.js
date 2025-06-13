const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant reference is required'],
  },
  foodName: {
    type: String,
    required: [true, 'Please add the food name'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity'],
  },
  pickupAddress: {
    type: String,
    required: [true, 'Please provide the pickup address'],
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please add the expiry date and time'],
  },
  status: {
    type: String,
    enum: ['Available', 'Requested', 'Picked'],
    default: 'Available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Food', FoodSchema);
