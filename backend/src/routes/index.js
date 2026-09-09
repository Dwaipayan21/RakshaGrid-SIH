const express = require('express');
const router = express.Router();

const stateRoutes = require('./state.routes');
const districtRoutes = require('./district.routes');
const zoneRoutes = require('./zone.routes');
const settlementRoutes = require('./settlement.routes');
const authRoutes = require('./auth.routes');
const riskEngineRoutes = require('./riskEngine.routes');
const ApiResponse = require('../utils/apiResponse');

// Health Check
router.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    service: 'RakshaGrid Disaster Intelligence Backend',
    version: 'v1.0.0-assam-proto',
    timestamp: new Date().toISOString(),
  }, 'RakshaGrid API is operating normally');
});

// Mounted Resource Routes
router.use('/states', stateRoutes);
router.use('/districts', districtRoutes);
router.use('/zones', zoneRoutes);
router.use('/settlements', settlementRoutes);
router.use('/auth', authRoutes);
router.use('/risk', riskEngineRoutes);

module.exports = router;
