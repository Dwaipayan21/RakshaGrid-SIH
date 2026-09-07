const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { requireAuthority } = require('../middlewares/rbac.middleware');
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  createZoneSchema,
  updateZoneSchema,
  queryZoneSchema,
  zoneIdParamSchema,
  riskClassParamSchema,
} = require('../validators/zone.validator');

// Public read routes
router.get('/', publicRateLimiter, validate({ query: queryZoneSchema }), zoneController.getAllZones);

// Filter zones by riskClass (e.g., GET /api/v1/zones/risk-class/RED)
router.get(
  '/risk-class/:riskClass',
  publicRateLimiter,
  validate({ params: riskClassParamSchema, query: queryZoneSchema }),
  zoneController.getZonesByRiskClass
);

router.get('/:id', publicRateLimiter, validate({ params: zoneIdParamSchema }), zoneController.getZoneById);

// Authority-protected mutating routes
router.post(
  '/',
  authenticate,
  requireAuthority,
  validate({ body: createZoneSchema }),
  zoneController.createZone
);

router.put(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: zoneIdParamSchema, body: updateZoneSchema }),
  zoneController.updateZone
);

router.delete(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: zoneIdParamSchema }),
  zoneController.deleteZone
);

module.exports = router;
