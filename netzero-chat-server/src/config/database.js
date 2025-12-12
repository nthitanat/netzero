const mysql = require('mysql2/promise');
require('dotenv').config();

// Import environment configuration
const config = require('./env');

// Use database configuration from env helper
const dbConfig = config.database;

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

// Execute command function (for non-query commands like CREATE, ALTER, DROP)
const executeCommand = async (command, params = []) => {
  try {
    const [result] = await pool.execute(command, params);
    return [result];
  } catch (error) {
    console.error('Chat Server - Database command error:', error);
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
  executeCommand,
  getConnection,
  closePool,
  dbConfig
};
