// ============================================================
// server.js - Entry point for EventFlow backend
// Sets up Express, connects to MongoDB, and mounts all routes
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────


app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json()); // Parse incoming JSON request bodies

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/events',   require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// ── Health check endpoint ─────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'EventFlow API is running 🚀' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

// ── Connect to MongoDB and start server ───────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
