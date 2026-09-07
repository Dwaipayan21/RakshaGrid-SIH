const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');

/**
 * Auth Controller - HTTP layer only
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.success(res, result, 'Login successful');
});

const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, req.user, 'Profile retrieved successfully');
});

module.exports = {
  register,
  login,
  getProfile,
};
