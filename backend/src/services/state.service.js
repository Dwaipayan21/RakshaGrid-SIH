const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * State Service - Encapsulates database operations and business logic for States
 */
class StateService {
  async getAll({ page = 1, limit = 20, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, states] = await Promise.all([
      prisma.state.count({ where }),
      prisma.state.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { districts: true },
          },
        },
      }),
    ]);

    return {
      states,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id) {
    const state = await prisma.state.findUnique({
      where: { id },
      include: {
        districts: {
          select: {
            id: true,
            name: true,
            _count: { select: { zones: true } },
          },
        },
      },
    });

    if (!state) {
      throw ApiError.notFound(`State with ID '${id}' not found`);
    }

    return state;
  }

  async create(data) {
    const existing = await prisma.state.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    });

    if (existing) {
      throw ApiError.conflict(`State with name '${data.name}' or code '${data.code}' already exists`);
    }

    return prisma.state.create({ data });
  }

  async update(id, data) {
    await this.getById(id);

    if (data.name || data.code) {
      const existing = await prisma.state.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.code ? [{ code: data.code }] : []),
          ],
        },
      });

      if (existing) {
        throw ApiError.conflict('State name or code is already in use by another state');
      }
    }

    return prisma.state.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    await this.getById(id);
    return prisma.state.delete({ where: { id } });
  }
}

module.exports = new StateService();
