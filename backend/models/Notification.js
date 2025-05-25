const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { // The user receiving the notification (Restaurant in this case)
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant' 
  },
  senderNgo: { // The NGO who triggered the notification
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'NGO'
  },
  foodListing: { // The related food listing
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'FoodListing'
  },
  message: { // A descriptive message
    type: String,
    required: true,
  },
  type: { // Type of notification (e.g., 'Claim')
    type: String,
    enum: ['Claim', 'System', 'Message'], // Add other types as needed
    default: 'Claim',
  },
  isRead: { // Status if the notification has been seen
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Notification', notificationSchema); 