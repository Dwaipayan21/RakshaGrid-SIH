require('dotenv').config();

const http = require('http');
const app = require('./app');
const prisma = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  try {
    // Attempt database connection check
    logger.info('Connecting to PostgreSQL / PostGIS database via Prisma...');
    await prisma.$connect();
    logger.info('Database connection established successfully.');
  } catch (err) {
    logger.warn('Database connection warning (Server will still boot, check DATABASE_URL):', err.message);
  }

  server.listen(PORT, () => {
    logger.info(`RakshaGrid Backend Server is running on port ${PORT}`);
    logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
    logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

// Graceful Shutdown
const handleShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database client disconnected.');
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
