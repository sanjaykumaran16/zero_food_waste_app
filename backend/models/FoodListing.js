const mongoose = require('mongoose');

const FoodListingSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant', // Assumes you have a 'Restaurant' model
  },
  itemName: {
    type: String,
    required: [true, 'Please add the food item name'],
    trim: true,
  },
  quantity: {
    type: String, // Using String for flexibility (e.g., "approx 5kg", "10 meals")
    required: [true, 'Please add the quantity'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add the expiry date'],
  },
  address: { // Denormalizing address for easier display for NGOs
    type: String,
    required: true, 
  },
  listedAt: {
    type: Date,
    default: Date.now,
  },
  status: { // Track the status of the listing
    type: String,
    required: true,
    enum: ['Available', 'Collected', 'Expired'], // Example statuses
    default: 'Available',
  },
  collectedByNgo: { // Reference to the NGO that collected the food
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO', // Match the exported model name 'NGO' (was 'Ngo')
    default: null // Initially null, set when an NGO collects it
  }
  // Consider adding a status field later (e.g., 'available', 'claimed', 'picked-up')
});

module.exports = mongoose.model('FoodListing', FoodListingSchema); 