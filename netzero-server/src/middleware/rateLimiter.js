const rateLimit = require('express-rate-limit');
const config = require('../config/env');

function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    }
  });
}

const apiLimiter = createLimiter({
  windowMs: config.rateLimit.apiWindowMs,
  max: config.isDevelopment ? config.rateLimit.devApiMax : config.rateLimit.apiMax,
  message: 'Too many requests from this IP, please try again later.'
});
const authLimiter = createLimiter({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: 'Too many authentication attempts from this IP, please try again later.'
});

module.exports = { apiLimiter, authLimiter };
