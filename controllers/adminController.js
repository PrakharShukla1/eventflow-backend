// ============================================================
// controllers/adminController.js
// Admin-only operations: dashboard stats, manage users,
// view all bookings, approve/reject bookings
// ============================================================

const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// ── GET /api/admin/dashboard ──────────────────────────────────
// Returns summary stats for the admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Run all count queries in parallel for performance
    const [totalUsers, totalEvents, totalBookings, recentBookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments(),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
      Booking.find()
        .populate('userId', 'name email')
        .populate('eventId', 'title date')
        .sort({ createdAt: -1 })
        .limit(5), // Last 5 bookings
    ]);

    res.json({ totalUsers, totalEvents, totalBookings, recentBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
// Admin: List all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────
// Admin: Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/admin/bookings ───────────────────────────────────
// Admin: View all bookings across all events
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/admin/bookings/:id/status ────────────────────────
// Admin: Approve or reject a booking
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Only allow valid status transitions
    if (!['confirmed', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    res.json({ message: `Booking ${status}.`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser, getAllBookings, updateBookingStatus };
