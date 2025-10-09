const jwt = require('jsonwebtoken');

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
      console.error('Chat Server - Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

// Optional authentication middleware - doesn't require token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
          };
        }
      } catch (error) {
        // Token is invalid or expired, but we continue without authentication
        console.log('Chat Server - Optional auth - invalid token:', error.message);
      }
    }

    next();

  } catch (error) {
    console.error('Chat Server - Optional authentication error:', error);
    // Continue without authentication on error
    next();
  }
};

// Rate limiting middleware for chat endpoints
const chatRateLimit = (req, res, next) => {
  // Basic rate limiting for chat endpoints
  // In production, use express-rate-limit with Redis
  
  const key = `chat_requests_${req.ip}`;
  const requests = req.session ? req.session[key] || 0 : 0;
  const maxRequests = 100; // 100 requests per window
  const windowMs = 60 * 1000; // 1 minute

  if (requests >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many chat requests. Please try again later'
    });
  }

  // Store request count (simplified - use Redis in production)
  if (req.session) {
    req.session[key] = requests + 1;
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
  optionalAuth,
  chatRateLimit
};
