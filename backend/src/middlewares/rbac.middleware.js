const ApiError = require('../utils/apiError');
const { ROLES } = require('../config/constants');

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * Allows restricting routes to specific user roles (e.g. Authority vs Citizen/Public).
 *
 * @param {string|string[]} allowedRoles Single role or array of allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Map shorthand names if needed
  const normalizedAllowedRoles = roles.map((role) => {
    if (role.toLowerCase() === 'authority') return ROLES.AUTHORITY;
    if (role.toLowerCase() === 'citizen') return ROLES.CITIZEN;
    if (role.toLowerCase() === 'field_officer') return ROLES.FIELD_OFFICER;
    return role;
  });

  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication is required before role check.'));
    }

    if (!req.user.role || !normalizedAllowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: User role '${req.user.role || 'UNKNOWN'}' is not authorized to perform this action. Required: ${normalizedAllowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

module.exports = {
  requireRole,
  requireAuthority: requireRole(ROLES.AUTHORITY),
  requireCitizen: requireRole(ROLES.CITIZEN),
  requireFieldOfficer: requireRole(ROLES.FIELD_OFFICER),
};
