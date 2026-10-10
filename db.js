// =========================================================
//database para mo connect sa mysql
// =========================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rice_expert',
  port: Number(process.env.DB_PORT) || 3306,
});

module.exports = pool;
