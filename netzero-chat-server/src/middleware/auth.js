const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

function readBearerToken(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function authenticateToken(req, res, next) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required', timestamp: new Date().toISOString() });
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { ...payload, userId: payload.userId ?? payload.id };
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token', timestamp: new Date().toISOString() });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Access denied. User not authenticated', timestamp: new Date().toISOString() });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient privileges', timestamp: new Date().toISOString() });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = { ...payload, userId: payload.userId ?? payload.id };
    } catch {
      // Optional authentication allows anonymous requests.
    }
  }
  next();
}

const chatRateLimit = rateLimit({
  windowMs: config.welcomeChat.rateLimitWindowMs,
  max: config.welcomeChat.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many chat requests. Please try again later' }
});

module.exports = { authenticateToken, authorizeRoles, optionalAuth, chatRateLimit };
