/**
 * Higher-order function to wrap async Express route handlers
 * and catch unhandled promise rejections, passing them to the next error middleware.
 *
 * @param {Function} requestHandler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
