const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

/**
 * Public Endpoint Rate Limiter
 * Limits repeated requests to public APIs (e.g. 100 requests per 15 minutes)
 */
const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return res.status(429).json(
      new ApiResponse(
        429,
        null,
        'Too many requests from this IP, please try again after 15 minutes.'
      )
    );
  },
});

/**
 * Auth Rate Limiter
 * Stricter limit on auth routes to prevent brute-force attacks
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json(
      new ApiResponse(
        429,
        null,
        'Too many authentication attempts, please try again after 15 minutes.'
      )
    );
  },
});

module.exports = {
  publicRateLimiter,
  authRateLimiter,
};
