const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config/env');

// Import configuration and middleware
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { 
  requestLogger, 
  corsOptions, 
  securityHeaders, 
  requestId 
} = require('./src/middleware');

// Import routes
const eventRoutes = require('./src/routes/eventRoutes');
const connectionRoutes = require('./src/routes/connectionRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const userEventRoutes = require('./src/routes/userEventRoutes');
const eventProductRoutes = require('./src/routes/eventProductRoutes');
const productRoutes = require('./src/routes/productRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const chatAppRoutes = require('./src/routes/chatAppRoutes');
const surveyRoutes = require('./src/routes/surveyRoutes');
const glocalRoutes = require('./src/routes/glocalRoutes');
const systemRoutes = require('./src/routes/systemRoutes');

// Initialize Express app
const app = express();
const port = config.port;
const apiPrefix = config.apiPrefix;
const apiVersion = config.apiVersion;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Custom security headers
app.use(securityHeaders);

// Request ID middleware
app.use(requestId);

// CORS configuration
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Rate limiting
app.use(apiLimiter);

// Request logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: config.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

// System routes
app.use('/', systemRoutes);

// API Routes
app.use(`${apiPrefix}/${apiVersion}/events`, eventRoutes);
app.use(`${apiPrefix}/${apiVersion}/connection`, connectionRoutes);
app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);
app.use(`${apiPrefix}/${apiVersion}/users`, userRoutes);
app.use(`${apiPrefix}/${apiVersion}/user-events`, userEventRoutes);
app.use(`${apiPrefix}/${apiVersion}/event-products`, eventProductRoutes);
app.use(`${apiPrefix}/${apiVersion}/products`, productRoutes);
app.use(`${apiPrefix}/${apiVersion}/reservations`, reservationRoutes);
app.use(`${apiPrefix}/${apiVersion}/chatapps`, chatAppRoutes);
app.use(`${apiPrefix}/${apiVersion}/surveys`, surveyRoutes);
app.use(`${apiPrefix}/${apiVersion}/glocal`, glocalRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log('🚀 NetZero API Server Starting...');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Environment: ${config.env}`);
  console.log(`🌐 Server: http://0.0.0.0:${port}`);
  console.log(`🌐 Server (localhost): http://localhost:${port}`);
  console.log(`🔗 Health Check: http://localhost:${port}/health`);
  console.log(`🗄️  Database Test: http://localhost:${port}/db-test`);
  console.log(`📚 API Base: http://localhost:${port}${apiPrefix}/${apiVersion}`);
  console.log(`📋 Events API: http://localhost:${port}${apiPrefix}/${apiVersion}/events`);
  console.log(`🔐 Auth API: http://localhost:${port}${apiPrefix}/${apiVersion}/auth`);
  console.log(`👤 Users API: http://localhost:${port}${apiPrefix}/${apiVersion}/users`);
  console.log(`🛍️  Products API: http://localhost:${port}${apiPrefix}/${apiVersion}/products`);
  console.log(`📝 Reservations API: http://localhost:${port}${apiPrefix}/${apiVersion}/reservations`);
  console.log('═══════════════════════════════════════');
  console.log('🎉 NetZero API Server is ready!');
});

// Error handling for server startup
server.on('error', (error) => {
  console.error('❌ Server startup error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Port ${port} is already in use. Please try a different port or stop the process using this port.`);
  }
  process.exit(1);
});

module.exports = app;
