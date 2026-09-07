const { z } = require('zod');

const createDistrictSchema = z.object({
  name: z.string().trim().min(1, 'District name is required'),
  stateId: z.string().uuid('Invalid State ID format'),
});

const updateDistrictSchema = createDistrictSchema.partial();

const queryDistrictSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  stateId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

const districtIdParamSchema = z.object({
  id: z.string().uuid('Invalid District ID format'),
});

module.exports = {
  createDistrictSchema,
  updateDistrictSchema,
  queryDistrictSchema,
  districtIdParamSchema,
};
