const express = require("express");

const {
  assessSettlementRisk,
  checkRiskEngineHealth,
} = require("../services/riskEngine.service");

const router = express.Router();

/**
 * GET /api/v1/risk/health
 *
 * Check whether the Python Risk Engine is available.
 */
router.get("/health", async (req, res) => {
  try {
    const result = await checkRiskEngineHealth();

    return res.status(200).json({
      status: "success",
      riskEngine: result,
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      message: "Risk Engine is unavailable.",
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/risk/assess
 *
 * Send a settlement to the Python Risk Engine.
 */
router.post("/assess", async (req, res) => {
  try {
    const { settlement } = req.body;

    if (!settlement || typeof settlement !== "object") {
      return res.status(400).json({
        status: "error",
        message: "Settlement data is required.",
      });
    }

    const result = await assessSettlementRisk(
      settlement
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Risk assessment route error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      status: "error",
      message:
        error.message ||
        "Risk assessment failed.",
      details: error.details || null,
    });
  }
});

module.exports = router;