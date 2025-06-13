const express = require('express');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Ngo = require('../models/Ngo');
const FoodListing = require('../models/FoodListing');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/myNotifications', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('senderNgo', 'name')
      .populate('foodListing', 'itemName')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500);
    throw new Error('Server error while fetching notifications');
  }
}));

router.put('/markAllRead', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500);
    throw new Error('Server error while marking notifications as read');
  }
}));

router.delete('/deleteAll', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id });

    res.status(200).json({
      message: 'All notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500);
    throw new Error('Server error while deleting notifications');
  }
}));

module.exports = router;
