require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Files
const restaurantRoutes = require('./routes/restaurant');
const ngoRoutes = require('./routes/ngo');
const foodListingRoutes = require('./routes/foodlisting');
const statsRoutes = require('./routes/stats'); // Import stats routes
const notificationRoutes = require('./routes/notification'); // Import notification routes

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to ignore favicon requests silently
app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    // Respond with 204 No Content, telling the browser there's nothing to display
    return res.status(204).end();
  }
  next(); // Pass the request to the next middleware if it's not for the favicon
});

// Basic route
app.get('/', (req, res) => {
  res.send('Zero Food Wastage API Running');
});

// Mount Routers
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/foodlistings', foodListingRoutes);
app.use('/api/stats', statsRoutes); // Mount stats routes
app.use('/api/notifications', notificationRoutes); // Use notification routes

// --- Error Handling Middleware --- 
// Middleware to catch requests to non-existent routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General error handler (catches errors passed by next() or thrown by asyncHandler)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error("--- SERVER ERROR ---", err); // Log the actual error on the backend
  res.json({
    message: err.message,
    // Optionally include stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
// --- End Error Handling --- 

const PORT = process.env.PORT || 5000; // Changed default port to 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 