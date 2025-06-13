const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const NGO = require('../models/Ngo');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id, type: 'ngo' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, address, contactNumber } = req.body;

  if (!name || !email || !password || !address || !contactNumber) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, address, contactNumber');
  }

  const ngoExists = await NGO.findOne({ email });
  if (ngoExists) {
    res.status(400);
    throw new Error('NGO already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const ngo = await NGO.create({
    name,
    email,
    password: hashedPassword,
    address,
    contactNumber,
  });

  if (ngo) {
    res.status(201).json({
      message: 'NGO registered successfully',
      _id: ngo._id,
      name: ngo.name,
      email: ngo.email,
      address: ngo.address,
      contactNumber: ngo.contactNumber,
      token: generateToken(ngo._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid NGO data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const ngo = await NGO.findOne({ email });

  if (ngo && (await bcrypt.compare(password, ngo.password))) {
    res.status(200).json({
      message: 'Login successful',
      _id: ngo._id,
      name: ngo.name,
      email: ngo.email,
      token: generateToken(ngo._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
}));

router.get('/me', protect, restrictTo('ngo'), asyncHandler(async (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404);
    throw new Error('NGO not found or not authorized');
  }
}));

module.exports = router;
