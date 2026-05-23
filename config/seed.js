// ============================================================
// config/seed.js - Seed the database with sample data
// Run with: npm run seed
// ⚠️  WARNING: This will DELETE existing data before seeding!
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log('🗑️  Cleared existing data');

    // ── Create Users ─────────────────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventflow.com',
      password: adminPassword,
      role: 'admin',
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: userPassword,
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@example.com',
      password: userPassword,
      role: 'user',
    });

    console.log('👤 Users seeded');

    // ── Create Events ─────────────────────────────────────────
    const events = await Event.insertMany([
      {
        title: 'Tech Summit 2025',
        description: 'A premier technology conference bringing together industry leaders to discuss AI, cloud computing, and the future of software development.',
        date: new Date('2025-03-15'),
        time: '09:00 AM',
        location: 'Convention Center, Bhopal',
        totalSeats: 200,
        bookedSeats: 45,
        category: 'Conference',
        createdBy: admin._id,
      },
      {
        title: 'React.js Workshop',
        description: 'Hands-on workshop covering React hooks, state management, and building full-stack applications with the MERN stack.',
        date: new Date('2025-03-20'),
        time: '10:00 AM',
        location: 'IIT Campus, Indore',
        totalSeats: 50,
        bookedSeats: 12,
        category: 'Workshop',
        createdBy: admin._id,
      },
      {
        title: 'Classical Music Night',
        description: 'An enchanting evening of classical Indian music featuring renowned artists from across the country.',
        date: new Date('2025-04-05'),
        time: '07:00 PM',
        location: 'Ravindra Bhavan, Bhopal',
        totalSeats: 300,
        bookedSeats: 180,
        category: 'Concert',
        createdBy: admin._id,
      },
      {
        title: 'Startup Networking Mixer',
        description: 'Connect with fellow entrepreneurs, investors, and mentors in a relaxed environment. Pitch your ideas and find collaborators.',
        date: new Date('2025-04-10'),
        time: '06:00 PM',
        location: 'The Startup Hub, Pune',
        totalSeats: 80,
        bookedSeats: 30,
        category: 'Networking',
        createdBy: admin._id,
      },
      {
        title: 'Cricket Tournament Finals',
        description: 'The grand finale of the inter-college cricket tournament. Come support your favorite team in this exciting match!',
        date: new Date('2025-04-20'),
        time: '02:00 PM',
        location: 'City Sports Stadium, Nagpur',
        totalSeats: 500,
        bookedSeats: 220,
        category: 'Sports',
        createdBy: admin._id,
      },
    ]);

    console.log('🎉 Events seeded');

    // ── Create Bookings ───────────────────────────────────────
    await Booking.insertMany([
      { userId: user1._id, eventId: events[0]._id, status: 'confirmed' },
      { userId: user1._id, eventId: events[1]._id, status: 'confirmed' },
      { userId: user2._id, eventId: events[0]._id, status: 'confirmed' },
      { userId: user2._id, eventId: events[2]._id, status: 'cancelled' },
    ]);

    console.log('📋 Bookings seeded');

    console.log('\n🌱 Seed completed! Login credentials:');
    console.log('   Admin → email: admin@eventflow.com | password: admin123');
    console.log('   User  → email: rahul@example.com   | password: user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
