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
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query function for SELECT operations (returns rows only)
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute command function for INSERT, UPDATE, DELETE operations (returns full result)
const executeCommand = async (query, params = []) => {
  try {
    const result = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error('Database command error:', error);
    throw error;
  }
};

// Execute transaction function for multiple operations
const executeTransaction = async (operations) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of operations) {
      const result = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Database transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Get connection from pool
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
};

// Close pool function
const closePool = async () => {
  try {
    await pool.end();
    console.log('📴 Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeCommand,
  executeTransaction,
  getConnection,
  closePool,
  dbConfig
};
