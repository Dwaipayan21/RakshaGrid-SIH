const express = require('express');
const router = express.Router();
const stateController = require('../controllers/state.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { requireAuthority } = require('../middlewares/rbac.middleware');
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  createStateSchema,
  updateStateSchema,
  queryStateSchema,
  stateIdParamSchema,
} = require('../validators/state.validator');

// Public read routes
router.get('/', publicRateLimiter, validate({ query: queryStateSchema }), stateController.getAllStates);
router.get('/:id', publicRateLimiter, validate({ params: stateIdParamSchema }), stateController.getStateById);

// Authority-protected mutating routes
router.post(
  '/',
  authenticate,
  requireAuthority,
  validate({ body: createStateSchema }),
  stateController.createState
);

router.put(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: stateIdParamSchema, body: updateStateSchema }),
  stateController.updateState
);

router.delete(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: stateIdParamSchema }),
  stateController.deleteState
);

module.exports = router;
