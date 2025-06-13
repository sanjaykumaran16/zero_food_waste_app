const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!dbURI) {
      throw new Error('MONGO_URI not found in environment variables. Please set it up in your .env file.');
    }
    await mongoose.connect(dbURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
