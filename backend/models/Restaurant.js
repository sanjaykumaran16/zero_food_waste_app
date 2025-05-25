const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    // Consider adding minlength and select: false after hashing is implemented
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number'],
  },
  createdAt: { // Adding a timestamp for record creation
    type: Date,
    default: Date.now,
  },
});

// Remember to implement password hashing (e.g., using bcryptjs) before saving!

module.exports = mongoose.model('Restaurant', RestaurantSchema);