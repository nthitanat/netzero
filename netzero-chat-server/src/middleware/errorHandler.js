// Error handler middleware for chat server

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Chat API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};

// Global error handler
const errorHandler = (error, req, res, next) => {
  console.error('🚨 Chat Server Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message: message,
    timestamp: new Date().toISOString()
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📝 ${req.method} ${req.originalUrl} - Chat Server`);
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next();
};

// Response formatter middleware
const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to format responses
  res.json = function(data) {
    // If data already has success/message structure, use as-is
    if (data && typeof data === 'object' && data.hasOwnProperty('success')) {
      return originalJson.call(this, data);
    }

    // Format the response
    const formattedResponse = {
      success: res.statusCode < 400,
      message: res.locals.message || (res.statusCode < 400 ? 'Request successful' : 'Request failed'),
      data: res.locals.error ? undefined : (res.locals.data || data),
      error: res.locals.error,
      timestamp: new Date().toISOString()
    };

    return originalJson.call(this, formattedResponse);
  };

  next();
};

module.exports = {
  notFound,
  errorHandler,
  requestLogger,
  responseFormatter
};