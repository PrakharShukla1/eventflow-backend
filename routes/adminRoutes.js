// routes/adminRoutes.js - Admin-only endpoints
const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, deleteUser, getAllBookings, updateBookingStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);                      // GET    /api/admin/dashboard
router.get('/users', getAllUsers);                                // GET    /api/admin/users
router.delete('/users/:id', deleteUser);                         // DELETE /api/admin/users/:id
router.get('/bookings', getAllBookings);                          // GET    /api/admin/bookings
router.put('/bookings/:id/status', updateBookingStatus);         // PUT    /api/admin/bookings/:id/status

module.exports = router;
