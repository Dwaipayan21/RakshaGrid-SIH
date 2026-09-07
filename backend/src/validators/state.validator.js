const { z } = require('zod');

const createStateSchema = z.object({
  name: z.string().trim().min(1, 'State name is required'),
  code: z.string().trim().min(2).max(10, 'State code must be 2-10 uppercase characters').toUpperCase(),
});

const updateStateSchema = createStateSchema.partial();

const queryStateSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
});

const stateIdParamSchema = z.object({
  id: z.string().uuid('Invalid State ID format'),
});

module.exports = {
  createStateSchema,
  updateStateSchema,
  queryStateSchema,
  stateIdParamSchema,
};
