const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * District Service - Encapsulates database operations and logic for Districts
 */
class DistrictService {
  async getAll({ page = 1, limit = 20, stateId, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (stateId) {
      where.stateId = stateId;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, districts] = await Promise.all([
      prisma.district.count({ where }),
      prisma.district.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          state: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { zones: true },
          },
        },
      }),
    ]);

    return {
      districts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id) {
    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        state: true,
        zones: {
          select: {
            id: true,
            name: true,
            hazardScore: true,
            riskClass: true,
            _count: { select: { settlements: true } },
          },
        },
      },
    });

    if (!district) {
      throw ApiError.notFound(`District with ID '${id}' not found`);
    }

    return district;
  }

  async create(data) {
    const state = await prisma.state.findUnique({ where: { id: data.stateId } });
    if (!state) {
      throw ApiError.notFound(`Parent State with ID '${data.stateId}' not found`);
    }

    const existing = await prisma.district.findFirst({
      where: {
        name: data.name,
        stateId: data.stateId,
      },
    });

    if (existing) {
      throw ApiError.conflict(`District '${data.name}' already exists in this state`);
    }

    return prisma.district.create({
      data,
      include: { state: true },
    });
  }

  async update(id, data) {
    await this.getById(id);

    if (data.stateId) {
      const state = await prisma.state.findUnique({ where: { id: data.stateId } });
      if (!state) {
        throw ApiError.notFound(`Target State with ID '${data.stateId}' not found`);
      }
    }

    if (data.name) {
      const current = await prisma.district.findUnique({ where: { id } });
      const targetStateId = data.stateId || current.stateId;

      const existing = await prisma.district.findFirst({
        where: {
          id: { not: id },
          name: data.name,
          stateId: targetStateId,
        },
      });

      if (existing) {
        throw ApiError.conflict(`District '${data.name}' already exists in this state`);
      }
    }

    return prisma.district.update({
      where: { id },
      data,
      include: { state: true },
    });
  }

  async delete(id) {
    await this.getById(id);
    return prisma.district.delete({ where: { id } });
  }
}

module.exports = new DistrictService();
