const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

async function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(payload.userId ?? payload.id);
    if (user) {
      req.user = { userId: user.userId, email: user.email, role: user.role };
    }
  } catch {
    // Optional authentication allows anonymous requests.
  }
  next();
}

function authenticateSurveyMonkeyWebhook(req, res, next) {
  const credential = req.headers.authorization;
  if (!credential || !config.surveyMonkey.webhookSecret || credential !== config.surveyMonkey.webhookSecret) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature', timestamp: new Date().toISOString() });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  authenticateSurveyMonkeyWebhook
};
