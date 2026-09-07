const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);

router.get('/me', authenticate, authController.getProfile);

module.exports = router;
