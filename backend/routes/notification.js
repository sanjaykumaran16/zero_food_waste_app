const express = require('express');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Ngo = require('../models/Ngo');
const FoodListing = require('../models/FoodListing');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get notifications for the logged-in user (restaurant)
// @route   GET /api/notifications/myNotifications
// @access  Private (Restaurant Only)
router.get('/myNotifications', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('senderNgo', 'name') // Keep this field name
            .populate('foodListing', 'itemName') // Populate item name from foodListing ID
            .sort({ createdAt: -1 }); // Show newest notifications first

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500);
        throw new Error('Server error while fetching notifications');
    }
}));

// @desc    Mark all notifications as read for the logged-in restaurant
// @route   PUT /api/notifications/markAllRead
// @access  Private (Restaurant Only)
router.put('/markAllRead', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user._id, isRead: false }, // Find unread notifications for this user
            { $set: { isRead: true } } // Set isRead to true
        );

        res.status(200).json({ 
            message: 'Notifications marked as read', 
            modifiedCount: result.modifiedCount // Send back how many were updated
        });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500);
        throw new Error('Server error while marking notifications as read');
    }
}));

// @desc    Delete all notifications for the logged-in restaurant
// @route   DELETE /api/notifications/deleteAll
// @access  Private (Restaurant Only)
router.delete('/deleteAll', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
    try {
        const result = await Notification.deleteMany({ recipient: req.user._id }); // Delete all for this user

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

// Optional TODO: Add route to mark specific notifications as read
// router.put('/:id/read', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => { ... });

module.exports = router; 