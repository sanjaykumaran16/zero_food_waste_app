const mongoose = require('mongoose');

const FoodListingSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  itemName: {
    type: String,
    required: [true, 'Please add the food item name'],
    trim: true,
  },
  quantity: {
    type: String,
    required: [true, 'Please add the quantity'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add the expiry date'],
  },
  address: {
    type: String,
    required: true,
  },
  listedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Collected', 'Expired'],
    default: 'Available',
  },
  collectedByNgo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    default: null,
  },
});

module.exports = mongoose.model('FoodListing', FoodListingSchema);
