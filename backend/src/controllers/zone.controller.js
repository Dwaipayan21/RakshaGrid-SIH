const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const zoneService = require('../services/zone.service');

/**
 * Zone Controller - HTTP layer only
 */
const getAllZones = asyncHandler(async (req, res) => {
  const { page, limit, districtId, riskClass } = req.query;
  const result = await zoneService.getAll({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    districtId,
    riskClass,
  });

  return ApiResponse.success(res, result.zones, 'Zones retrieved successfully', 200, result.pagination);
});

const getZoneById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const zone = await zoneService.getById(id);
  return ApiResponse.success(res, zone, 'Zone retrieved successfully');
});

const getZonesByRiskClass = asyncHandler(async (req, res) => {
  // Support both param (:riskClass) and query (?riskClass=RED)
  const riskClass = req.params.riskClass || req.query.riskClass;
  const { page, limit, districtId } = req.query;

  const result = await zoneService.getByRiskClass(riskClass, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    districtId,
  });

  return ApiResponse.success(
    res,
    result.zones,
    `Zones with risk class '${riskClass}' retrieved successfully`,
    200,
    result.pagination
  );
});

const createZone = asyncHandler(async (req, res) => {
  const zone = await zoneService.create(req.body);
  return ApiResponse.created(res, zone, 'Zone created successfully');
});

const updateZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const zone = await zoneService.update(id, req.body);
  return ApiResponse.success(res, zone, 'Zone updated successfully');
});

const deleteZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await zoneService.delete(id);
  return ApiResponse.success(res, null, 'Zone deleted successfully');
});

module.exports = {
  getAllZones,
  getZoneById,
  getZonesByRiskClass,
  createZone,
  updateZone,
  deleteZone,
};
