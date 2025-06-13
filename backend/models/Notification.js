const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant',
  },
  senderNgo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'NGO',
  },
  foodListing: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'FoodListing',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Claim', 'System', 'Message'],
    default: 'Claim',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
