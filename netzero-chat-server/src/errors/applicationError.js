const STATUS_BY_CODE = Object.freeze({
  VALIDATION: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  AI_UNAVAILABLE: 502,
  EXTERNAL: 503,
  DATABASE_UNAVAILABLE: 500
});

function applicationError(code, message, options = {}) {
  const error = new Error(message, { cause: options.cause });
  error.code = code;
  error.statusCode = STATUS_BY_CODE[code] || 500;
  return error;
}

module.exports = { applicationError };
