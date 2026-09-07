const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

/**
 * Authentication Middleware: Verifies JWT and attaches authenticated user to req.user
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is required. Please provide a valid Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rakshagrid_prototype_jwt_secret_change_in_production');

    // Attach decoded user data
    // Optionally fetch active user from DB if id exists
    if (decoded.id) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organization: true,
        },
      });

      if (!user) {
        throw ApiError.unauthorized('User associated with this token no longer exists.');
      }

      req.user = user;
    } else {
      req.user = decoded;
    }

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication token has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }
});

module.exports = authenticate;
