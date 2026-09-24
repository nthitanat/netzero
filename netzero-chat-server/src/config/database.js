const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.database);

// Database setup scripts use these single-statement helpers outside HTTP workflows.
async function executeQuery(query, params = []) {
  const [rows] = await pool.execute(query, params);
  return rows;
}

async function executeCommand(command, params = []) {
  const [result] = await pool.execute(command, params);
  return [result];
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Chat Server database connection failed:', error.message);
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

module.exports = {
  pool,
  executeQuery,
  executeCommand,
  testConnection,
  withTransaction,
  closePool
};
