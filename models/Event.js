// ============================================================
// models/Event.js - Mongoose schema for Event collection
// Fields: title, description, date, time, location, totalSeats,
//         bookedSeats, category, createdBy
// ============================================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Must have at least 1 seat'],
    },
    bookedSeats: {
      type: Number,
      default: 0, // Starts at zero; increments on each booking
    },
    category: {
      type: String,
      enum: ['Conference', 'Workshop', 'Concert', 'Sports', 'Networking', 'Other'],
      default: 'Other',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the admin who created this event
      required: true,
    },
  },
  { timestamps: true }
);

// ── Virtual: Calculate available seats ───────────────────────
eventSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeats;
});

// Ensure virtuals are included when converting to JSON
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
