// ============================================================
// controllers/bookingController.js
// Handles booking creation, cancellation, and viewing
// Prevents double booking using unique index in the model
// ============================================================

const Booking = require('../models/Booking');
const Event = require('../models/Event');

// ── POST /api/bookings ────────────────────────────────────────
// Authenticated user: Book an event
const bookEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // 1. Check if event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // 2. Check seat availability
    if (event.bookedSeats >= event.totalSeats) {
      return res.status(400).json({ message: 'Sorry, this event is fully booked.' });
    }

    // 3. Check if user already booked this event (compound unique index will also catch this)
    const alreadyBooked = await Booking.findOne({ userId: req.user._id, eventId });
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You have already booked this event.' });
    }

    // 4. Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
    });

    // 5. Increment bookedSeats count on the event
    event.bookedSeats += 1;
    await event.save();

    // 6. Populate details for response
    const populated = await booking.populate([
      { path: 'userId', select: 'name email' },
      { path: 'eventId', select: 'title date location' },
    ]);

    res.status(201).json({ message: 'Event booked successfully!', booking: populated });
  } catch (error) {
    // Handle duplicate booking from MongoDB unique index
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already booked this event.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/bookings/my ──────────────────────────────────────
// Authenticated user: Get all bookings made by the logged-in user
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('eventId', 'title date time location category')
      .sort({ createdAt: -1 }); // Newest first

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/bookings/:id/cancel ──────────────────────────────
// Authenticated user: Cancel their own booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Ensure user can only cancel their own booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    // Prevent cancelling an already-cancelled booking
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Decrement bookedSeats on the event (free up the seat)
    await Event.findByIdAndUpdate(booking.eventId, { $inc: { bookedSeats: -1 } });

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookEvent, getMyBookings, cancelBooking };
