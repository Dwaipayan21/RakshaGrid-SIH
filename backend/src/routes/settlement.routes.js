const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlement.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { requireAuthority } = require('../middlewares/rbac.middleware');
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  createSettlementSchema,
  updateSettlementSchema,
  querySettlementSchema,
  settlementIdParamSchema,
} = require('../validators/settlement.validator');

// Public read routes
router.get('/', publicRateLimiter, validate({ query: querySettlementSchema }), settlementController.getAllSettlements);

// Population density endpoint: Feature 1 (GET /api/v1/settlements/:id/density)
router.get(
  '/:id/density',
  publicRateLimiter,
  validate({ params: settlementIdParamSchema }),
  settlementController.getPopulationDensity
);

router.get('/:id', publicRateLimiter, validate({ params: settlementIdParamSchema }), settlementController.getSettlementById);

// Authority-protected mutating routes
router.post(
  '/',
  authenticate,
  requireAuthority,
  validate({ body: createSettlementSchema }),
  settlementController.createSettlement
);

router.put(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: settlementIdParamSchema, body: updateSettlementSchema }),
  settlementController.updateSettlement
);

router.delete(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: settlementIdParamSchema }),
  settlementController.deleteSettlement
);

module.exports = router;
