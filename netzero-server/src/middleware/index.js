const { randomUUID } = require('crypto');
const config = require('../config/env');

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  console.log(`${req.method} ${req.originalUrl} requestId=${req.id}`);
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${Date.now() - startedAt} requestId=${req.id}`);
  });
  next();
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || config.isDevelopment || config.cors.origin.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error('Origin not allowed');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With', 'Accept',
    'Origin', 'Cache-Control', 'X-File-Name'
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: config.cors.maxAgeSeconds,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

function securityHeaders(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}

module.exports = { requestLogger, corsOptions, securityHeaders, requestId };
