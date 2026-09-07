const { z } = require('zod');
const { RISK_CLASSES } = require('../config/constants');

const riskClassEnumValues = Object.values(RISK_CLASSES);

const createZoneSchema = z.object({
  name: z.string().trim().min(1, 'Zone name is required'),
  districtId: z.string().uuid('Invalid District ID format'),
  hazardScore: z.coerce.number().min(0).max(100).optional().default(0.0),
  riskClass: z.enum(riskClassEnumValues, {
    errorMap: () => ({ message: `Risk class must be one of: ${riskClassEnumValues.join(', ')}` }),
  }).optional().default(RISK_CLASSES.GREEN),
});

const updateZoneSchema = createZoneSchema.partial();

const queryZoneSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  districtId: z.string().uuid().optional(),
  riskClass: z.enum(riskClassEnumValues).optional(),
});

const zoneIdParamSchema = z.object({
  id: z.string().uuid('Invalid Zone ID format'),
});

const riskClassParamSchema = z.object({
  riskClass: z.enum(riskClassEnumValues, {
    errorMap: () => ({ message: `Invalid risk class. Must be one of: ${riskClassEnumValues.join(', ')}` }),
  }),
});

module.exports = {
  createZoneSchema,
  updateZoneSchema,
  queryZoneSchema,
  zoneIdParamSchema,
  riskClassParamSchema,
};
