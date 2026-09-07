const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Settlement Service - Encapsulates database operations and demographic calculations for Settlements
 */
class SettlementService {
  async getAll({ page = 1, limit = 20, zoneId, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (zoneId) {
      where.zoneId = zoneId;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, settlements] = await Promise.all([
      prisma.settlement.count({ where }),
      prisma.settlement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          zone: {
            select: {
              id: true,
              name: true,
              riskClass: true,
              hazardScore: true,
              district: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      settlements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id) {
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        zone: {
          include: {
            district: {
              include: { state: true },
            },
          },
        },
      },
    });

    if (!settlement) {
      throw ApiError.notFound(`Settlement with ID '${id}' not found`);
    }

    return settlement;
  }

  /**
   * Calculates population density (persons per sq km) for a settlement
   * @param {string} id - Settlement UUID
   */
  async getPopulationDensity(id) {
    const settlement = await this.getById(id);

    // Feature 1: Population density calculation
    const density = settlement.areaSqKm > 0 
      ? Number((settlement.population / settlement.areaSqKm).toFixed(2))
      : 0;

    return {
      settlementId: settlement.id,
      settlementName: settlement.name,
      population: settlement.population,
      households: settlement.households,
      areaSqKm: settlement.areaSqKm,
      populationDensityPerSqKm: density,
      // Metadata tag for prototype tracking
      isPrototypeData: true,
    };
  }

  // TODO: implement in vulnerability.service.js (Vulnerability living conditions scoring)
  // TODO: implement in riskEngine.service.js (H/E/V/A/C priority score calculation)
  // TODO: implement in shelterMatching.service.js (Safe shelter recommendation)

  async create(data) {
    const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
    if (!zone) {
      throw ApiError.notFound(`Parent Zone with ID '${data.zoneId}' not found`);
    }

    return prisma.settlement.create({
      data,
      include: {
        zone: {
          include: { district: true },
        },
      },
    });
  }

  async update(id, data) {
    await this.getById(id);

    if (data.zoneId) {
      const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
      if (!zone) {
        throw ApiError.notFound(`Target Zone with ID '${data.zoneId}' not found`);
      }
    }

    return prisma.settlement.update({
      where: { id },
      data,
      include: {
        zone: {
          include: { district: true },
        },
      },
    });
  }

  async delete(id) {
    await this.getById(id);
    return prisma.settlement.delete({ where: { id } });
  }
}

module.exports = new SettlementService();
