function errorHandler(error, req, res, next) {
  console.error('Request error:', {
    requestId: req.id,
    name: error.name,
    code: error.code,
    message: error.message
  });

  let statusCode = error.statusCode || 500;
  let message = error.statusCode ? error.message : 'Internal server error';
  let code = error.statusCode ? error.code : undefined;

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate field value entered';
    code = 'CONFLICT';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(value => value.message).join(', ');
    code = 'VALIDATION';
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON format';
    code = 'VALIDATION';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
    timestamp: new Date().toISOString()
  });
}

function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFound, asyncHandler };
