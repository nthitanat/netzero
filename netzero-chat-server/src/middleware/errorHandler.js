function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Chat API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
}

function errorHandler(error, req, res, next) {
  console.error('Chat Server error:', {
    code: error.code,
    name: error.name,
    message: error.message,
    method: req.method,
    url: req.url
  });

  let statusCode = error.statusCode || 500;
  let message = error.statusCode ? error.message : 'Internal Server Error';
  let code = error.statusCode ? error.code : undefined;
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'CONFLICT';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist';
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

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  console.log(`${req.method} ${req.originalUrl} - Chat Server`);
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${Date.now() - startedAt}`);
  });
  next();
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { notFound, errorHandler, requestLogger, asyncHandler };
