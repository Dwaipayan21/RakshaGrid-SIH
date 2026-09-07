const ApiError = require('../utils/apiError');

/**
 * Zod Schema Validation Middleware Factory
 * Supports validating req.body, req.query, and req.params against Zod schemas.
 *
 * @param {import('zod').ZodSchema | { body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Case 1: Schema has explicit body/query/params keys
      if (schema.body || schema.query || schema.params) {
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = await schema.query.parseAsync(req.query);
        }
        if (schema.params) {
          req.params = await schema.params.parseAsync(req.params);
        }
      } else {
        // Case 2: Schema directly validates req.body
        req.body = await schema.parseAsync(req.body);
      }
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const formattedErrors = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return next(ApiError.badRequest('Validation failed', formattedErrors));
      }
      return next(err);
    }
  };
};

module.exports = validate;
