const ERROR_STATUS = Object.freeze({
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  EXTERNAL: 503,
  DATABASE_UNAVAILABLE: 500
});

function applicationError(code, message, options = {}) {
  const error = new Error(message, options);
  error.code = code;
  error.statusCode = ERROR_STATUS[code];
  return error;
}

module.exports = { applicationError, ERROR_STATUS };
