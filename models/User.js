// ============================================================
// models/User.js - Mongoose schema for User collection
// Fields: name, email, password (hashed), role
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Only these two roles are allowed
      default: 'user',
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// ── Pre-save hook: Hash password before saving to DB ─────────
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on every save)
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: Compare entered password with hashed ─────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
