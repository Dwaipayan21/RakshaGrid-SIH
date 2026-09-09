/**
 * RakshaGrid Risk Engine Service
 *
 * Node.js backend → Python FastAPI Risk Engine
 */

const RISK_ENGINE_URL =
  process.env.RISK_ENGINE_URL || "http://127.0.0.1:8000";

/**
 * Send a settlement to the Python risk engine
 * and receive its risk assessment.
 *
 * @param {Object} settlement
 * @returns {Promise<Object>}
 */
const assessSettlementRisk = async (settlement) => {
  try {
    const response = await fetch(
      `${RISK_ENGINE_URL}/api/v1/risk/assess`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          settlement,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.detail?.message ||
          "Risk engine assessment failed."
      );

      error.statusCode = response.status;
      error.details = data?.detail;

      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      "Risk Engine Error:",
      error.message
    );

    throw error;
  }
};

/**
 * Check whether the Python risk engine is available.
 *
 * @returns {Promise<Object>}
 */
const checkRiskEngineHealth = async () => {
  try {
    const response = await fetch(
      `${RISK_ENGINE_URL}/health`
    );

    if (!response.ok) {
      throw new Error(
        `Risk engine returned HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Risk Engine Health Check Failed:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  assessSettlementRisk,
  checkRiskEngineHealth,
};