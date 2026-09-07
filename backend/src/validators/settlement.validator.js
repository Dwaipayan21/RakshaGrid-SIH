const { z } = require('zod');
const { HOUSING_STRUCTURES } = require('../config/constants');

const housingEnumValues = Object.values(HOUSING_STRUCTURES);

const createSettlementSchema = z.object({
  name: z.string().trim().min(1, 'Settlement name is required'),
  zoneId: z.string().uuid('Invalid Zone ID format'),
  population: z.coerce.number().int().nonnegative('Population must be a non-negative integer'),
  households: z.coerce.number().int().nonnegative('Households must be a non-negative integer'),
  areaSqKm: z.coerce.number().positive('Area in sq km must be greater than 0'),
  vulnerabilityScore: z.coerce.number().min(0).max(100).optional().default(0),
  nearestHospitalKm: z.coerce.number().nonnegative('Distance to nearest hospital must be non-negative'),
  housingStructure: z.enum(housingEnumValues, {
    errorMap: () => ({ message: `Housing structure must be one of: ${housingEnumValues.join(', ')}` }),
  }),
  lat: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lon: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

const updateSettlementSchema = createSettlementSchema.partial();

const querySettlementSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  zoneId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

const settlementIdParamSchema = z.object({
  id: z.string().uuid('Invalid Settlement ID format'),
});

module.exports = {
  createSettlementSchema,
  updateSettlementSchema,
  querySettlementSchema,
  settlementIdParamSchema,
};
