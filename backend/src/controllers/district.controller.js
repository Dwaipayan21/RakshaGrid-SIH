const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const districtService = require('../services/district.service');

/**
 * District Controller - HTTP layer only
 */
const getAllDistricts = asyncHandler(async (req, res) => {
  const { page, limit, stateId, search } = req.query;
  const result = await districtService.getAll({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    stateId,
    search,
  });

  return ApiResponse.success(res, result.districts, 'Districts retrieved successfully', 200, result.pagination);
});

const getDistrictById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const district = await districtService.getById(id);
  return ApiResponse.success(res, district, 'District retrieved successfully');
});

const createDistrict = asyncHandler(async (req, res) => {
  const district = await districtService.create(req.body);
  return ApiResponse.created(res, district, 'District created successfully');
});

const updateDistrict = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const district = await districtService.update(id, req.body);
  return ApiResponse.success(res, district, 'District updated successfully');
});

const deleteDistrict = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await districtService.delete(id);
  return ApiResponse.success(res, null, 'District deleted successfully');
});

module.exports = {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
};
