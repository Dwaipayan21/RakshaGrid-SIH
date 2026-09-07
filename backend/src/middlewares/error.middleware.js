const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Centralized Express Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack, false);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${error.message}`, error.stack);
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${error.message}`);
  }

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
