const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authentication middleware - verifies JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  });
};

// Authorization middleware - checks user roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient privileges'
        });
      }

      next();

    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated'
      });
    }

    const resourceUserId = parseInt(req.params.id);
    const requestingUserId = req.user.userId;
    const requestingUserRole = req.user.role;

    // Allow if user is admin or owns the resource
    if (requestingUserRole === 'admin' || resourceUserId === requestingUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources'
    });

  } catch (error) {
    console.error('Owner/Admin authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authorization'
    });
  }
};

// Optional authentication middleware - doesn't require token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
          };
        }
      } catch (error) {
        // Token is invalid or expired, but we continue without authentication
        console.log('Optional auth - invalid token:', error.message);
      }
    }

    next();

  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without authentication on error
    next();
  }
};

// Middleware to validate user ID parameter
const validateUserIdParam = (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID parameter'
      });
    }

    req.params.id = userId; // Ensure it's stored as integer
    next();

  } catch (error) {
    console.error('User ID validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during validation'
    });
  }
};

// Rate limiting middleware for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This is a basic implementation. For production, use a proper rate limiting library
  // like express-rate-limit with Redis store
  
  const key = `auth_attempts_${req.ip}`;
  const attempts = req.session ? req.session[key] || 0 : 0;
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (attempts >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later'
    });
  }

  // Store attempt count (this is simplified - use Redis in production)
  if (req.session) {
    req.session[key] = attempts + 1;
    setTimeout(() => {
      if (req.session && req.session[key]) {
        delete req.session[key];
      }
    }, windowMs);
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  optionalAuth,
  validateUserIdParam,
  authRateLimit
};