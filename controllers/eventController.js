// ============================================================
// controllers/eventController.js
// CRUD operations for events
// Admin: create, update, delete | Public: list, search, detail
// ============================================================

const Event = require('../models/Event');

// ── GET /api/events ───────────────────────────────────────────
// Public: List all events with optional search and filters
const getEvents = async (req, res) => {
  try {
    const { search, category, date } = req.query;

    // Build dynamic filter object
    let filter = {};

    // Search by title or location (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by date (events on or after the given date)
    if (date) {
      filter.date = { $gte: new Date(date) };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email') // Include creator's name/email
      .sort({ date: 1 }); // Sort by soonest first

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/events/:id ───────────────────────────────────────
// Public: Get a single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/events ──────────────────────────────────────────
// Admin only: Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, totalSeats, category } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      totalSeats,
      category,
      createdBy: req.user._id, // Logged-in admin's ID
    });

    res.status(201).json({ message: 'Event created successfully!', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/events/:id ───────────────────────────────────────
// Admin only: Update an existing event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Update only the provided fields
    const { title, description, date, time, location, totalSeats, category } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (totalSeats) event.totalSeats = totalSeats;
    if (category) event.category = category;

    const updated = await event.save();
    res.json({ message: 'Event updated!', event: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/events/:id ────────────────────────────────────
// Admin only: Delete an event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
