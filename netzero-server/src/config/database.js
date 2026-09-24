const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.database);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

async function withTransaction(operation) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const value = await operation(connection);
    await connection.commit();
    return value;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function closePool() {
  await pool.end();
}

module.exports = { pool, testConnection, withTransaction, closePool };
