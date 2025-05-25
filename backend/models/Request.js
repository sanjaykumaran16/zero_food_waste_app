const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food', // Reference to the Food model
    required: [true, 'Food item reference is required'],
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO', // Reference to the NGO model
    required: [true, 'NGO reference is required'],
  },
  requestTime: {
    type: Date,
    default: Date.now,
  },
  pickupScheduled: {
    type: Boolean,
    default: false,
  },
  // Consider adding a status field here if needed later, e.g., 'Pending', 'Accepted', 'Rejected'
});

module.exports = mongoose.model('Request', RequestSchema);