const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging Middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Health / Landing
app.get('/', (req, res) => {
  res.json({
    name: 'RakshaGrid API (Assam Disaster Intelligence Platform Prototype)',
    status: 'online',
    docs: '/api/v1/health',
  });
});

// API Routes Mounted under /api/v1
app.use('/api/v1', routes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route '${req.originalUrl}' not found on this server.`));
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
