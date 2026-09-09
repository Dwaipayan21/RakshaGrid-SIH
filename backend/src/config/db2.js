// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // fallback to individual fields if you're not using a connection string
  // host: process.env.DB_HOST,
  // port: process.env.DB_PORT || 5432,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL (PostGIS enabled DB)');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

// Helper to run queries without importing Pool everywhere
const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};