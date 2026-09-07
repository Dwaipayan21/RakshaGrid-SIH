const { z } = require('zod');
const { ROLES } = require('../config/constants');

const roleEnumValues = Object.values(ROLES);

const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(roleEnumValues, {
    errorMap: () => ({ message: `Role must be one of: ${roleEnumValues.join(', ')}` }),
  }).optional().default(ROLES.CITIZEN),
  organization: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
