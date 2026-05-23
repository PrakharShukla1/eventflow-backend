// routes/bookingRoutes.js - Booking endpoints
const express = require('express');
const router = express.Router();
const { bookEvent, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', protect, bookEvent);                     // POST /api/bookings
router.get('/my', protect, getMyBookings);                // GET  /api/bookings/my
router.put('/:id/cancel', protect, cancelBooking);        // PUT  /api/bookings/:id/cancel

module.exports = router;
