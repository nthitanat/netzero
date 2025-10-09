require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import configuration and middleware
const { testConnection } = require('./src/config/database');
const { 
  errorHandler, 
  notFound, 
  requestLogger, 
  responseFormatter 
} = require('./src/middleware/errorHandler');

// Import routes
const chatRoutes = require('./src/routes/chatRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.CHAT_PORT || 3004;
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
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',  // React development server
    'http://127.0.0.1:3000',
    'https://your-domain.com' // Production domain
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
    message: 'NetZero Chat Server is running',
    service: 'netzero-chat-server',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API information endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to NetZero Chat API',
    service: 'netzero-chat-server',
    version: '1.0.0',
    documentation: {
      chat: `${API_PREFIX}/${API_VERSION}/chat`,
      health: '/health'
    },
    endpoints: {
      chat: {
        welcome: `GET ${API_PREFIX}/${API_VERSION}/chat/:chatid`,
        sendMessage: `POST ${API_PREFIX}/${API_VERSION}/chat/:chatid/message`,
        getHistory: `GET ${API_PREFIX}/${API_VERSION}/chat/:chatid/history`,
        health: `GET ${API_PREFIX}/${API_VERSION}/chat/health`
      }
    },
    usage: {
      authentication: 'Bearer token required for most endpoints',
      rateLimit: '100 requests per minute per IP',
      messageFormat: {
        send: {
          method: 'POST',
          url: '/api/v1/chat/{chatid}/message',
          body: { message: 'Your message here' },
          headers: { 'Authorization': 'Bearer your-jwt-token' }
        }
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
        message: 'Chat Server - Database connection successful',
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
        message: 'Chat Server - Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Chat Server - Database connection error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use(`${API_PREFIX}/${API_VERSION}/chat`, chatRoutes);

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
const server = app.listen(PORT, '127.0.0.1', async () => {
  console.log('🚀 NetZero Chat Server Starting...');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://127.0.0.1:${PORT}`);
  console.log(`🔗 Health Check: http://127.0.0.1:${PORT}/health`);
  console.log(`🗄️  Database Test: http://127.0.0.1:${PORT}/db-test`);
  console.log(`📚 API Base: http://127.0.0.1:${PORT}${API_PREFIX}/${API_VERSION}`);
  console.log(`💬 Chat API: http://127.0.0.1:${PORT}${API_PREFIX}/${API_VERSION}/chat`);
  console.log('═══════════════════════════════════════');
  
  // Test database connection on startup
  console.log('🔍 Testing database connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Database connected successfully');
  } else {
    console.log('❌ Database connection failed');
    console.log('⚠️  Chat server started but database is not available');
  }
  
  console.log('🎉 NetZero Chat Server is ready!');
  console.log(`💬 Ready to handle chat requests for chat applications`);
});

module.exports = app;
