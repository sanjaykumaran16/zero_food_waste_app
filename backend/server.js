require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const restaurantRoutes = require('./routes/restaurant');
const ngoRoutes = require('./routes/ngo');
const foodListingRoutes = require('./routes/foodlisting');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notification');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Zero Food Wastage API Running');
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/foodlistings', foodListingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.error("--- SERVER ERROR ---", err);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
