const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

// @desc    Register a new user (defaults to 'customer' role)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  // Only allow 'admin' role to be set here if explicitly requested.
  // In a real system, admin creation would be gated further (e.g. invite-only).
  // Left simple/permissive for assignment purposes, per README notes.
  const assignedRole = role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER;

  const user = await User.create({ name, email, password, role: assignedRole });

  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.status(200).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get the currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { register, login, getMe };
