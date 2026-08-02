// Message substrings (from application-level `throw new Error(...)` calls in
// models/controllers) mapped to the HTTP status code they should produce.
// Centralizing this here means any thrown Error anywhere in the app gets a
// consistent status code, instead of each controller re-implementing its own
// (partial, inconsistent) copy of this classification.
const MESSAGE_STATUS_RULES = [
  { pattern: /already associated|already joined|already exists/i, statusCode: 409 },
  { pattern: /access denied|permission/i, statusCode: 403 },
  { pattern: /not found/i, statusCode: 404 },
  { pattern: /insufficient|invalid|required/i, statusCode: 400 }
];

function classifyByMessage(message = '') {
  const rule = MESSAGE_STATUS_RULES.find(({ pattern }) => pattern.test(message));
  return rule ? rule.statusCode : null;
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  let statusCode = err.statusCode;
  let message = err.message;
  // Whether `message` is safe to expose to the client. Known/expected error
  // types (validation, duplicate entry, "not found", etc.) carry app-generated
  // messages that are safe. Anything unrecognized may contain raw DB/internal
  // details and must not be leaked to the client.
  let exposeMessage = Boolean(statusCode);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate field value entered';
    exposeMessage = true;
  }

  // MySQL "table doesn't exist" error
  if (err.code === 'ER_NO_SUCH_TABLE') {
    statusCode = 500;
    message = 'Database table not found';
    exposeMessage = true;
  }

  // MySQL connection error
  if (err.code === 'ECONNREFUSED') {
    statusCode = 500;
    message = 'Database connection failed';
    exposeMessage = true;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
    exposeMessage = true;
  }

  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format';
    exposeMessage = true;
  }

  // Fall back to classifying plain `throw new Error('...')` from app code
  // (e.g. "Access denied", "Product not found", "Insufficient stock").
  if (!statusCode) {
    const classified = classifyByMessage(err.message);
    if (classified) {
      statusCode = classified;
      exposeMessage = true;
    }
  }

  res.status(statusCode || 500).json({
    success: false,
    message: exposeMessage && message ? message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 Not Found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
