const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const stateService = require('../services/state.service');

/**
 * State Controller - HTTP layer only
 */
const getAllStates = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await stateService.getAll({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    search,
  });

  return ApiResponse.success(res, result.states, 'States retrieved successfully', 200, result.pagination);
});

const getStateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const state = await stateService.getById(id);
  return ApiResponse.success(res, state, 'State retrieved successfully');
});

const createState = asyncHandler(async (req, res) => {
  const state = await stateService.create(req.body);
  return ApiResponse.created(res, state, 'State created successfully');
});

const updateState = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const state = await stateService.update(id, req.body);
  return ApiResponse.success(res, state, 'State updated successfully');
});

const deleteState = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await stateService.delete(id);
  return ApiResponse.success(res, null, 'State deleted successfully');
});

module.exports = {
  getAllStates,
  getStateById,
  createState,
  updateState,
  deleteState,
};
