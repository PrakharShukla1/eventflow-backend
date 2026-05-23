// ============================================================
// middleware/authMiddleware.js
// Protects routes by verifying JWT token from request headers
// Also provides role-based access control (admin only routes)
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect: Verify JWT and attach user to request ───────────
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to the request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' });
  }
};

// ── AdminOnly: Only allow users with admin role ───────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = { protect, adminOnly };
