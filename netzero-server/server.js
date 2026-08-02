require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import configuration and middleware
const { testConnection } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { 
  requestLogger, 
  corsOptions, 
  securityHeaders, 
  responseFormatter,
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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';
const API_VERSION = process.env.API_VERSION || 'v1';

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
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response formatting
app.use(responseFormatter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NetZero API Server is running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API information endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to NetZero API',
    version: '1.0.0',
    documentation: {
      events: `${API_PREFIX}/${API_VERSION}/events`,
      connection: `${API_PREFIX}/${API_VERSION}/connection`,
      auth: `${API_PREFIX}/${API_VERSION}/auth`,
      users: `${API_PREFIX}/${API_VERSION}/users`,
      userEvents: `${API_PREFIX}/${API_VERSION}/user-events`,
      products: `${API_PREFIX}/${API_VERSION}/products`,
      reservations: `${API_PREFIX}/${API_VERSION}/reservations`,
      health: '/health',
      apiInfo: '/'
    },
    endpoints: {
      connection: {
        test: `GET ${API_PREFIX}/${API_VERSION}/connection/test`,
        ping: `GET ${API_PREFIX}/${API_VERSION}/connection/ping`,
        database: `GET ${API_PREFIX}/${API_VERSION}/connection/database`,
        status: `GET ${API_PREFIX}/${API_VERSION}/connection/status`,
        echo: `GET|POST ${API_PREFIX}/${API_VERSION}/connection/echo`
      },
      events: {
        getAll: `GET ${API_PREFIX}/${API_VERSION}/events`,
        getById: `GET ${API_PREFIX}/${API_VERSION}/events/:id`,
        getByCategory: `GET ${API_PREFIX}/${API_VERSION}/events/category/:category`,
        getUpcoming: `GET ${API_PREFIX}/${API_VERSION}/events/upcoming`,
        search: `GET ${API_PREFIX}/${API_VERSION}/events/search?q=term`,
        getStatistics: `GET ${API_PREFIX}/${API_VERSION}/events/statistics`,
        create: `POST ${API_PREFIX}/${API_VERSION}/events`,
        update: `PUT ${API_PREFIX}/${API_VERSION}/events/:id`,
        softDelete: `PATCH ${API_PREFIX}/${API_VERSION}/events/:id/soft-delete`,
        updateParticipants: `PATCH ${API_PREFIX}/${API_VERSION}/events/:id/participants`,
        delete: `DELETE ${API_PREFIX}/${API_VERSION}/events/:id`
      },
      auth: {
        register: `POST ${API_PREFIX}/${API_VERSION}/auth/register`,
        login: `POST ${API_PREFIX}/${API_VERSION}/auth/login`,
        verify: `GET ${API_PREFIX}/${API_VERSION}/auth/verify`,
        refresh: `POST ${API_PREFIX}/${API_VERSION}/auth/refresh`,
        logout: `POST ${API_PREFIX}/${API_VERSION}/auth/logout`
      },
      users: {
        getCurrentUser: `GET ${API_PREFIX}/${API_VERSION}/users/me`,
        getAllUsers: `GET ${API_PREFIX}/${API_VERSION}/users (Admin only)`,
        getUserById: `GET ${API_PREFIX}/${API_VERSION}/users/:id (Owner or Admin)`,
        updateUser: `PUT ${API_PREFIX}/${API_VERSION}/users/:id (Owner or Admin)`,
        updatePassword: `PUT ${API_PREFIX}/${API_VERSION}/users/:id/password (Owner or Admin)`,
        deleteUser: `DELETE ${API_PREFIX}/${API_VERSION}/users/:id (Owner or Admin)`
      },
      userEvents: {
        getUserEvents: `GET ${API_PREFIX}/${API_VERSION}/user-events/user/:userId/events`,
        getMyEvents: `GET ${API_PREFIX}/${API_VERSION}/user-events/my-events (Auth required)`,
        joinEvent: `POST ${API_PREFIX}/${API_VERSION}/user-events/join (Auth required)`,
        leaveEvent: `DELETE ${API_PREFIX}/${API_VERSION}/user-events/user/:userId/event/:eventId (Auth required)`,
        getEventUsers: `GET ${API_PREFIX}/${API_VERSION}/user-events/event/:eventId/users`,
        checkOwnership: `GET ${API_PREFIX}/${API_VERSION}/user-events/user/:userId/event/:eventId/ownership`
      },
      products: {
        getAll: `GET ${API_PREFIX}/${API_VERSION}/products`,
        getById: `GET ${API_PREFIX}/${API_VERSION}/products/:id`,
        getByType: `GET ${API_PREFIX}/${API_VERSION}/products/type/:type`,
        getRecommended: `GET ${API_PREFIX}/${API_VERSION}/products/recommended`,
        search: `GET ${API_PREFIX}/${API_VERSION}/products/search/:searchTerm`,
        getMy: `GET ${API_PREFIX}/${API_VERSION}/products/my (Auth required)`,
        create: `POST ${API_PREFIX}/${API_VERSION}/products (Auth required)`,
        update: `PUT ${API_PREFIX}/${API_VERSION}/products/:id (Owner or Admin)`,
        delete: `DELETE ${API_PREFIX}/${API_VERSION}/products/:id (Owner or Admin)`,
        uploadThumbnail: `POST ${API_PREFIX}/${API_VERSION}/products/:id/upload/thumbnail (Owner or Admin)`,
        uploadCover: `POST ${API_PREFIX}/${API_VERSION}/products/:id/upload/cover (Owner or Admin)`,
        uploadImages: `POST ${API_PREFIX}/${API_VERSION}/products/:id/upload/images (Owner or Admin)`
      },
      reservations: {
        getAll: `GET ${API_PREFIX}/${API_VERSION}/reservations (Auth required)`,
        getById: `GET ${API_PREFIX}/${API_VERSION}/reservations/:id (Auth required)`,
        getMy: `GET ${API_PREFIX}/${API_VERSION}/reservations/my (Auth required)`,
        getMyProducts: `GET ${API_PREFIX}/${API_VERSION}/reservations/my-products (Auth required)`,
        getStats: `GET ${API_PREFIX}/${API_VERSION}/reservations/stats (Auth required)`,
        create: `POST ${API_PREFIX}/${API_VERSION}/reservations (Auth required)`,
        update: `PUT ${API_PREFIX}/${API_VERSION}/reservations/:id (Auth required)`,
        delete: `DELETE ${API_PREFIX}/${API_VERSION}/reservations/:id (Auth required)`,
        confirm: `POST ${API_PREFIX}/${API_VERSION}/reservations/:id/confirm (Product Owner)`,
        cancel: `POST ${API_PREFIX}/${API_VERSION}/reservations/:id/cancel (Auth required)`,
        updateStatus: `PUT ${API_PREFIX}/${API_VERSION}/reservations/:id/status (Product Owner)`
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Database connection test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        database: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use(`${API_PREFIX}/${API_VERSION}/events`, eventRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/connection`, connectionRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/auth`, authRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/users`, userRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/user-events`, userEventRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/event-products`, eventProductRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/products`, productRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/reservations`, reservationRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/chatapps`, chatAppRoutes);
app.use(`${API_PREFIX}/${API_VERSION}/surveys`, surveyRoutes);

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
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 NetZero API Server Starting...');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Server (localhost): http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database Test: http://localhost:${PORT}/db-test`);
  console.log(`📚 API Base: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}`);
  console.log(`📋 Events API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/events`);
  console.log(`🔐 Auth API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/auth`);
  console.log(`👤 Users API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/users`);
  console.log(`🛍️  Products API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/products`);
  console.log(`📝 Reservations API: http://localhost:${PORT}${API_PREFIX}/${API_VERSION}/reservations`);
  console.log('═══════════════════════════════════════');
  console.log('🎉 NetZero API Server is ready!');
});

// Error handling for server startup
server.on('error', (error) => {
  console.error('❌ Server startup error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Port ${PORT} is already in use. Please try a different port or stop the process using this port.`);
  }
  process.exit(1);
});

module.exports = app;
