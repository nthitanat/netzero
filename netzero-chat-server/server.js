const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config/env');

// Import configuration and middleware
const { testConnection } = require('./src/config/database');
const { 
  errorHandler, 
  notFound, 
  requestLogger
} = require('./src/middleware/errorHandler');

// Import routes
const chatRoutes = require('./src/routes/chatRoutes');
const productSurveyRoutes = require('./src/routes/productSurveyRoutes');
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
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: config.cors.origins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
app.use(`${apiPrefix}/${apiVersion}/chat`, chatRoutes);
app.use(`${apiPrefix}/${apiVersion}/products`, productSurveyRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down chat server gracefully');
  server.close(() => {
    console.log('💀 Chat server process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down chat server gracefully');
  server.close(() => {
    console.log('💀 Chat server process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', async () => {
  console.log('🚀 NetZero Chat Server Starting...');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Environment: ${config.env}`);
  console.log(`🌐 Server: http://0.0.0.0:${port}`);
  console.log(`🔗 Health Check: http://localhost:${port}/health`);
  console.log(`🗄️  Database Test: http://localhost:${port}/db-test`);
  console.log(`📚 API Base: http://127.0.0.1:${port}${apiPrefix}/${apiVersion}`);
  console.log(`💬 Chat API: http://127.0.0.1:${port}${apiPrefix}/${apiVersion}/chat`);
  console.log('═══════════════════════════════════════');
  
  // Test database connection on startup
  console.log('🔍 Testing database connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Chat Server - Database connected successfully');
  } else {
    console.log('❌ Database connection failed');
    console.log('⚠️  Chat server started but database is not available');
  }
  
  console.log('🎉 NetZero Chat Server is ready!');
  console.log(`💬 Ready to handle chat requests for chat applications`);
});

module.exports = app;
