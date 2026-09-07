/**
 * System Constants & Governance Parameters
 * Note: Values labeled as PROTOTYPE are calibrated for the Assam flood pilot demo.
 */

const ROLES = {
  AUTHORITY: 'AUTHORITY_CONTROL_ROOM',
  CITIZEN: 'CITIZEN_PUBLIC',
  FIELD_OFFICER: 'FIELD_OFFICER',
};

const RISK_CLASSES = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  ORANGE: 'ORANGE',
  RED: 'RED',
};

const PRIORITY_BANDS = {
  P1: 'P1', // >= 75: Immediate
  P2: 'P2', // 50 - 74: High
  P3: 'P3', // 25 - 49: Moderate
  P4: 'P4', // < 25: Low / Routine
};

const HOUSING_STRUCTURES = {
  KUTCHA: 'KUTCHA',
  SEMI_PUCCA: 'SEMI_PUCCA',
  PUCCA: 'PUCCA',
};

const PRIORITY_WEIGHTS = {
  HAZARD: 0.40,      // H
  EXPOSURE: 0.20,    // E
  VULNERABILITY: 0.15,// V
  ACCESSIBILITY: 0.10,// A
  CAPACITY: 0.15,    // C
};

const MODEL_VERSION = 'v1.0.0-assam-proto';

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  RISK_CLASSES,
  PRIORITY_BANDS,
  HOUSING_STRUCTURES,
  PRIORITY_WEIGHTS,
  MODEL_VERSION,
  PAGINATION,
};
