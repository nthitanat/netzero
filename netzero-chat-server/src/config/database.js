const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'netzeroadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'netzero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Chat Server - Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Chat Server - Database connection failed:', error.message);
    return false;
  }
};

// Execute query function
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Chat Server - Database query error:', error);
    throw error;
  }
};

// Get connection from pool
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Chat Server - Error getting database connection:', error);
    throw error;
  }
};

// Close pool function
const closePool = async () => {
  try {
    await pool.end();
    console.log('📴 Chat Server - Database pool closed');
  } catch (error) {
    console.error('Chat Server - Error closing database pool:', error);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection,
  closePool,
  dbConfig
};
