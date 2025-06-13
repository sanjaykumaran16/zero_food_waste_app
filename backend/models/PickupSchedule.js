const mongoose = require('mongoose');

const PickupScheduleSchema = new mongoose.Schema({
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodRequest',
    required: true,
    unique: true,
  },
  pickup_date: {
    type: Date,
    required: [true, 'Please add the pickup date'],
  },
  pickup_time: {
    type: String,
    required: [true, 'Please add the pickup time'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format for time'],
  },
  scheduled_on: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PickupSchedule', PickupScheduleSchema);
