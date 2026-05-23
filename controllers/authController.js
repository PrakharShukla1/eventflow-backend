// ============================================================
// controllers/authController.js
// Handles user registration, login, and profile retrieval
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate a signed JWT token ──────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ── POST /api/auth/register ───────────────────────────────────
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Create user (password hashed in model pre-save hook)
    // Note: In production, prevent users from setting role=admin from frontend
    const user = await User.create({ name, email, password, role: role || 'user' });

    res.status(201).json({
      message: 'Registration successful!',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, getMe };
