const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const settlementService = require('../services/settlement.service');

/**
 * Settlement Controller - HTTP layer only
 */
const getAllSettlements = asyncHandler(async (req, res) => {
  const { page, limit, zoneId, search } = req.query;
  const result = await settlementService.getAll({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    zoneId,
    search,
  });

  return ApiResponse.success(res, result.settlements, 'Settlements retrieved successfully', 200, result.pagination);
});

const getSettlementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const settlement = await settlementService.getById(id);
  return ApiResponse.success(res, settlement, 'Settlement retrieved successfully');
});

/**
 * Village-wise Population Density Endpoint
 */
const getPopulationDensity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const densityData = await settlementService.getPopulationDensity(id);
  return ApiResponse.success(res, densityData, 'Population density calculated successfully');
});

const createSettlement = asyncHandler(async (req, res) => {
  const settlement = await settlementService.create(req.body);
  return ApiResponse.created(res, settlement, 'Settlement created successfully');
});

const updateSettlement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const settlement = await settlementService.update(id, req.body);
  return ApiResponse.success(res, settlement, 'Settlement updated successfully');
});

const deleteSettlement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await settlementService.delete(id);
  return ApiResponse.success(res, null, 'Settlement deleted successfully');
});

module.exports = {
  getAllSettlements,
  getSettlementById,
  getPopulationDensity,
  createSettlement,
  updateSettlement,
  deleteSettlement,
};
