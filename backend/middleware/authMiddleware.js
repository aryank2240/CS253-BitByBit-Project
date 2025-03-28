import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import res from "express/lib/response.js";

// Middleware to protect routes (authentication required)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
    token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired, please login again' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      return res.status(500).json({ message: 'Server error during authentication' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
// Middleware to check if the user is an admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
