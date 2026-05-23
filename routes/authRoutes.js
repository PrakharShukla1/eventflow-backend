// routes/authRoutes.js - Authentication endpoints
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);  // POST /api/auth/register
router.post('/login', loginUser);        // POST /api/auth/login
router.get('/me', protect, getMe);       // GET  /api/auth/me (requires auth)

module.exports = router;
