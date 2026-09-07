/**
 * Custom Operational API Error Class
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Array} [errors=[]]
   * @param {string} [stack='']
   * @param {boolean} [isOperational=true]
   */
  constructor(
    statusCode,
    message = 'Internal Server Error',
    errors = [],
    stack = '',
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden access') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal Server Error', errors = []) {
    return new ApiError(500, message, errors, '', false);
  }
}

module.exports = ApiError;
