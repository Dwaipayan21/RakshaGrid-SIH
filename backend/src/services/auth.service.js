const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Authentication Service
 */
class AuthService {
  async register({ email, password, name, role, organization, phone }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        organization,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        phone: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
      },
      token,
    };
  }

  generateToken(user) {
    const secret = process.env.JWT_SECRET || 'rakshagrid_prototype_jwt_secret_change_in_production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn }
    );
  }
}

module.exports = new AuthService();
