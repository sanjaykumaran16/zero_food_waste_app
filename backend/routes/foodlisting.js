const express = require('express');
const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification'); // Import Notification model
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// @desc    Create a new food listing
// @route   POST /api/foodlistings
// @access  Private (Restaurant Only)
router.post('/', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  const { itemName, quantity, expiryDate } = req.body;

  // Basic validation
  if (!itemName || !quantity || !expiryDate) {
    res.status(400);
    throw new Error('Please provide itemName, quantity, and expiryDate');
  }
  
  // req.user is attached by the protect middleware
  if (!req.user || !req.user.address) {
       res.status(400);
       throw new Error('Restaurant user data not found or missing address.');
  }

  try {
    const listing = await FoodListing.create({
      restaurant: req.user._id, // Get restaurant ID from authenticated user
      itemName,
      quantity,
      expiryDate,
      address: req.user.address, // Get address from authenticated restaurant user
    });

    res.status(201).json(listing); // Return the created listing
  } catch (error) {
     console.error("Error creating food listing:", error);
     res.status(500);
     throw new Error('Server error while creating food listing');
  }
}));

// @desc    Get all available food listings for NGOs
// @route   GET /api/foodlistings
// @access  Private (NGO Only)
router.get('/', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  try {
    // Fetch listings with status 'Available' and populate restaurant info
    const listings = await FoodListing.find({ 
      status: 'Available', // Only show available items
      expiryDate: { $gte: new Date() } // Only include listings that have not expired yet
    })
    .populate('restaurant', 'name address contactNumber') // Populate restaurant details
    .sort({ expiryDate: 1 }); // Sort by closest expiry first
    
    res.status(200).json(listings); 
  } catch (error) {
    console.error("Error fetching food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching food listings');
  }
}));

// @desc    Get food listings for the logged-in restaurant
// @route   GET /api/foodlistings/myListings
// @access  Private (Restaurant Only)
router.get('/myListings', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
  try {
    // Find listings where the restaurant field matches the logged-in user's ID
    const listings = await FoodListing.find({ restaurant: req.user._id })
      .populate('collectedByNgo', 'name contactNumber') // Populate NGO details if collected
      .sort({ listedAt: -1 }); // Sort by most recently listed first

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching restaurant's food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching your food listings');
  }
}));

// @desc    Get food listings collected by the logged-in NGO
// @route   GET /api/foodlistings/myReceived
// @access  Private (NGO Only)
router.get('/myReceived', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  try {
    // Find listings where collectedByNgo matches the logged-in NGO's ID
    // and status is 'Collected'
    const listings = await FoodListing.find({ 
      collectedByNgo: req.user._id, 
      status: 'Collected' 
    })
      .populate('restaurant', 'name') // Populate restaurant name
      .sort({ listedAt: -1 }); // Sort by most recently listed

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching NGO's received food listings:", error);
    res.status(500);
    throw new Error('Server error while fetching your received food listings');
  }
}));

// @desc    Claim an available food listing
// @route   PUT /api/foodlistings/:id/claim
// @access  Private (NGO Only)
router.put('/:id/claim', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    const ngoUser = req.user; // Logged in NGO user from protect middleware

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

        // Update listing status and claimed details
        listing.status = 'Collected'; // Or 'Claimed' if there's a separate collection step
        listing.collectedByNgo = ngoUser._id;
        listing.collectionTime = Date.now();

        const updatedListing = await listing.save();

        // Create notification for the restaurant
        await Notification.create({
            recipient: listing.restaurant, // Restaurant's ID from the listing
            senderNgo: ngoUser._id, // NGO's ID
            foodListing: listing._id, // The ID of the claimed listing
            message: `${ngoUser.name || 'An NGO'} has claimed your listing for "${listing.itemName}".`, // Construct message
            type: 'Claim'
        });

        res.status(200).json(updatedListing); // Return the updated listing

    } catch (error) {
        console.error("Error claiming food listing:", error);
        // Avoid throwing generic 500 if status already set
        if (!res.statusCode || res.statusCode < 400) {
             res.status(500);
        }
        throw new Error(error.message || 'Server error while claiming food listing');
    }
}));

// @desc    Update a food listing owned by the restaurant
// @route   PUT /api/foodlistings/:id
// @access  Private (Restaurant Only)
router.put('/:id', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
    const { itemName, quantity, expiryDate } = req.body;
    const listingId = req.params.id;
    const userId = req.user._id;

    // Basic validation for update fields
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

        // Authorization Check: Ensure the logged-in user owns the listing
        if (listing.restaurant.toString() !== userId.toString()) {
            res.status(403); // Forbidden
            throw new Error('User not authorized to update this listing.');
        }

        // Time Limit Check: Ensure the listing was created within the last 2 hours
        const twoHoursInMillis = 2 * 60 * 60 * 1000;
        const timeDifference = Date.now() - listing.listedAt.getTime();

        if (timeDifference >= twoHoursInMillis) {
            res.status(403); // Forbidden
            throw new Error('Editing is only allowed within 2 hours of creating the listing.');
        }
        
        // Prevent updating if already collected
        if (listing.status === 'Collected') {
            res.status(400);
            throw new Error('Cannot edit a listing that has already been collected.');
        }

        // Update the listing fields
        listing.itemName = itemName;
        listing.quantity = quantity;
        listing.expiryDate = expiryDate;
        // Optionally update an 'updatedAt' timestamp if you have one in your schema
        // listing.updatedAt = Date.now(); 

        const updatedListing = await listing.save();

        res.status(200).json(updatedListing); // Return the updated listing

    } catch (error) {
        console.error("Error updating food listing:", error);
        // Use the status code set previously if available (400, 403, 404)
        if (!res.statusCode || res.statusCode < 400) {
             res.status(500);
        }
        throw new Error(error.message || 'Server error while updating food listing');
    }
}));

// @desc    Delete a food listing owned by the restaurant
// @route   DELETE /api/foodlistings/:id
// @access  Private (Restaurant Only)
router.delete('/:id', protect, restrictTo('restaurant'), asyncHandler(async (req, res) => {
    const listingId = req.params.id;
    const userId = req.user._id;

    try {
        const listing = await FoodListing.findById(listingId);

        if (!listing) {
            res.status(404);
            throw new Error('Food listing not found.');
        }

        // Authorization Check: Ensure the logged-in user owns the listing
        if (listing.restaurant.toString() !== userId.toString()) {
            res.status(403); // Forbidden
            throw new Error('User not authorized to delete this listing.');
        }
        
        // Optional Check: Prevent deletion if already collected?
        // if (listing.status === 'Collected') {
        //     res.status(400);
        //     throw new Error('Cannot delete a listing that has already been collected.');
        // }

        await FoodListing.findByIdAndDelete(listingId);
        // Or: await listing.remove(); if you fetched the listing first

        res.status(200).json({ message: 'Food listing deleted successfully.' }); 
        // Use 204 No Content if you don't want to send a body
        // res.status(204).send(); 

    } catch (error) {
        console.error("Error deleting food listing:", error);
        if (!res.statusCode || res.statusCode < 400) {
             res.status(500);
        }
        throw new Error(error.message || 'Server error while deleting food listing');
    }
}));

module.exports = router; 