function sendSuccess(res, { message, data, statusCode = 200, ...metadata }) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...metadata,
    timestamp: new Date().toISOString()
  });
}

module.exports = { sendSuccess };
