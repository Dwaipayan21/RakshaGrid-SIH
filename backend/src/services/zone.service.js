const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Zone Service - Encapsulates database operations and logic for Zones
 */
class ZoneService {
  async getAll({ page = 1, limit = 20, districtId, riskClass } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (districtId) {
      where.districtId = districtId;
    }

    if (riskClass) {
      where.riskClass = riskClass;
    }

    const [total, zones] = await Promise.all([
      prisma.zone.count({ where }),
      prisma.zone.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ hazardScore: 'desc' }, { name: 'asc' }],
        include: {
          district: {
            select: { id: true, name: true, state: { select: { id: true, name: true, code: true } } },
          },
          _count: {
            select: { settlements: true },
          },
        },
      }),
    ]);

    return {
      zones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id) {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        district: {
          include: { state: true },
        },
        settlements: {
          select: {
            id: true,
            name: true,
            population: true,
            households: true,
            areaSqKm: true,
            vulnerabilityScore: true,
            housingStructure: true,
            lat: true,
            lon: true,
          },
        },
      },
    });

    if (!zone) {
      throw ApiError.notFound(`Zone with ID '${id}' not found`);
    }

    return zone;
  }

  async getByRiskClass(riskClass, { page = 1, limit = 20, districtId } = {}) {
    return this.getAll({ page, limit, districtId, riskClass });
  }

  async create(data) {
    const district = await prisma.district.findUnique({ where: { id: data.districtId } });
    if (!district) {
      throw ApiError.notFound(`Parent District with ID '${data.districtId}' not found`);
    }

    return prisma.zone.create({
      data,
      include: {
        district: {
          include: { state: true },
        },
      },
    });
  }

  async update(id, data) {
    await this.getById(id);

    if (data.districtId) {
      const district = await prisma.district.findUnique({ where: { id: data.districtId } });
      if (!district) {
        throw ApiError.notFound(`Target District with ID '${data.districtId}' not found`);
      }
    }

    return prisma.zone.update({
      where: { id },
      data,
      include: {
        district: {
          include: { state: true },
        },
      },
    });
  }

  async delete(id) {
    await this.getById(id);
    return prisma.zone.delete({ where: { id } });
  }
}

module.exports = new ZoneService();
