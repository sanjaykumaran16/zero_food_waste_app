const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: [true, 'Food item reference is required'],
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
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
});

module.exports = mongoose.model('Request', RequestSchema);
