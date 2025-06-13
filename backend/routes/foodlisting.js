const express = require('express');
const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  const { itemName, quantity, expiryDate } = req.body;

  if (!itemName || !quantity || !expiryDate) {
    res.status(400);
    throw new Error('Please provide itemName, quantity, and expiryDate');
  }

  if (!req.user || !req.user.address) {
    res.status(400);
    throw new Error('Restaurant user data not found or missing address.');
  }

  try {
    const listing = await FoodListing.create({
      restaurant: req.user._id,
      itemName,
      quantity,
      expiryDate,
      address: req.user.address,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error("Error creating food listing:", error);
    res.status(500);
    throw new Error('Server error while creating food listing');
  }
}));

router.get('/', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  try {
    const listings = await FoodListing.find({
      status: 'Available',
      expiryDate: { $gte: new Date() }
    })
      .populate('restaurant', 'name address contactNumber')
      .sort({ expiryDate: 1 });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching food listings');
  }
}));

router.get('/myListings', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  try {
    const listings = await FoodListing.find({ restaurant: req.user._id })
      .populate('collectedByNgo', 'name contactNumber')
      .sort({ listedAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching restaurant's food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching your food listings');
  }
}));

router.get('/myReceived', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  try {
    const listings = await FoodListing.find({
      collectedByNgo: req.user._id,
      status: 'Collected'
    })
      .populate('restaurant', 'name')
      .sort({ listedAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching NGO's received food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching your received food listings');
  }
}));

router.put('/:id/claim', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  const listingId = req.params.id;
  const ngoUser = req.user;

  try {
    const listing = await FoodListing.findById(listingId);

    if (!listing) {
      res.status(404);
      throw new Error('Food listing not found.');
    }

    if (listing.status !== 'Available') {
      res.status(400);
      throw new Error('Listing is no longer available.');
    }

    listing.status = 'Collected';
    listing.collectedByNgo = ngoUser._id;
    listing.collectionTime = Date.now();

    const updatedListing = await listing.save();

    await Notification.create({
      recipient: listing.restaurant,
      senderNgo: ngoUser._id,
      foodListing: listing._id,
      message: `${ngoUser.name || 'An NGO'} has claimed your listing for "${listing.itemName}".`,
      type: 'Claim'
    });

    res.status(200).json(updatedListing);

  } catch (error) {
    console.error("Error claiming food listing:", error);
    if (!res.statusCode || res.statusCode < 400) {
      res.status(500);
    }
    throw new Error(error.message || 'Server error while claiming food listing');
  }
}));

router.put('/:id', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  const { itemName, quantity, expiryDate } = req.body;
  const listingId = req.params.id;
  const userId = req.user._id;

  if (!itemName || !quantity || !expiryDate) {
    res.status(400);
    throw new Error('Please provide itemName, quantity, and expiryDate for the update.');
  }

  try {
    const listing = await FoodListing.findById(listingId);

    if (!listing) {
      res.status(404);
      throw new Error('Food listing not found.');
    }

    if (listing.restaurant.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('User not authorized to update this listing.');
    }

    const twoHoursInMillis = 2 * 60 * 60 * 1000;
    const timeDifference = Date.now() - listing.listedAt.getTime();

    if (timeDifference >= twoHoursInMillis) {
      res.status(403);
      throw new Error('Editing is only allowed within 2 hours of creating the listing.');
    }

    if (listing.status === 'Collected') {
      res.status(400);
      throw new Error('Cannot edit a listing that has already been collected.');
    }

    listing.itemName = itemName;
    listing.quantity = quantity;
    listing.expiryDate = expiryDate;

    const updatedListing = await listing.save();

    res.status(200).json(updatedListing);

  } catch (error) {
    console.error("Error updating food listing:", error);
    if (!res.statusCode || res.statusCode < 400) {
      res.status(500);
    }
    throw new Error(error.message || 'Server error while updating food listing');
  }
}));

router.delete('/:id', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  const listingId = req.params.id;
  const userId = req.user._id;

  try {
    const listing = await FoodListing.findById(listingId);

    if (!listing) {
      res.status(404);
      throw new Error('Food listing not found.');
    }

    if (listing.restaurant.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('User not authorized to delete this listing.');
    }

    await FoodListing.findByIdAndDelete(listingId);

    res.status(200).json({ message: 'Food listing deleted successfully.' });

  } catch (error) {
    console.error("Error deleting food listing:", error);
    if (!res.statusCode || res.statusCode < 400) {
      res.status(500);
    }
    throw new Error(error.message || 'Server error while deleting food listing');
  }
}));

module.exports = router;
