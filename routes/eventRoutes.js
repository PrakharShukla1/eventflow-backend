// routes/eventRoutes.js - Event CRUD endpoints
const express = require('express');
const router = express.Router();
const {
  getEvents, getEventById, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/', getEvents);           // GET  /api/events
router.get('/:id', getEventById);     // GET  /api/events/:id

// Admin-only routes
router.post('/', protect, adminOnly, createEvent);        // POST   /api/events
router.put('/:id', protect, adminOnly, updateEvent);      // PUT    /api/events/:id
router.delete('/:id', protect, adminOnly, deleteEvent);   // DELETE /api/events/:id

module.exports = router;
