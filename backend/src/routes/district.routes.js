const express = require('express');
const router = express.Router();
const districtController = require('../controllers/district.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');
const { requireAuthority } = require('../middlewares/rbac.middleware');
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  createDistrictSchema,
  updateDistrictSchema,
  queryDistrictSchema,
  districtIdParamSchema,
} = require('../validators/district.validator');

// Public read routes
router.get('/', publicRateLimiter, validate({ query: queryDistrictSchema }), districtController.getAllDistricts);
router.get('/:id', publicRateLimiter, validate({ params: districtIdParamSchema }), districtController.getDistrictById);

// Authority-protected mutating routes
router.post(
  '/',
  authenticate,
  requireAuthority,
  validate({ body: createDistrictSchema }),
  districtController.createDistrict
);

router.put(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: districtIdParamSchema, body: updateDistrictSchema }),
  districtController.updateDistrict
);

router.delete(
  '/:id',
  authenticate,
  requireAuthority,
  validate({ params: districtIdParamSchema }),
  districtController.deleteDistrict
);

module.exports = router;
