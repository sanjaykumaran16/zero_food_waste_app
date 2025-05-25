const mongoose = require('mongoose');

// IMPORTANT: Store your MongoDB connection string in an environment variable (e.g., in a .env file)
// and load it using a library like dotenv.
// Example .env file content:
// MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/zero_food_wastage?retryWrites=true&w=majority

// Retrieve the connection string from environment variables
const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!dbURI) {
      throw new Error('MONGO_URI not found in environment variables. Please set it up in your .env file.');
    }
    await mongoose.connect(dbURI, {
      // useNewUrlParser: true, // Deprecated
      // useUnifiedTopology: true, // Deprecated
      // Mongoose 6 doesn't require these options anymore, but keeping them for broader compatibility info
      // useCreateIndex: true, // Not supported in Mongoose 6+
      // useFindAndModify: false // Not supported in Mongoose 6+
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB; 