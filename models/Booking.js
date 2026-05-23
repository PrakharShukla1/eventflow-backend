// ============================================================
// models/Booking.js - Mongoose schema for Booking collection
// Fields: userId, eventId, status
// Unique index prevents double-booking same event by same user
// ============================================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
      default: 'confirmed', // Auto-confirm unless admin review is required
    },
  },
  { timestamps: true }
);

// ── Compound unique index: Prevent same user booking same event twice ──
bookingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
