const mongoose = require('mongoose');

const FoodRequestSchema = new mongoose.Schema({
  listing_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing', // Reference to the FoodListing model
    required: true,
  },
  ngo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo', // Reference to the Ngo model
    required: true,
  },
  quantity_requested: {
    type: Number,
    required: [true, 'Please specify the quantity requested']
  },
  request_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoodRequest', FoodRequestSchema); 