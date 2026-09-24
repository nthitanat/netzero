const config = require('../config/env');
const { testConnection } = require('../config/database');
const { applicationError } = require('../errors/applicationError');
const packageInfo = require('../../package.json');

function getHealth() {
  return {
    environment: config.env,
    version: packageInfo.version,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
}

function getApiInfo() {
  return {
    apiPrefix: config.apiPrefix,
    apiVersion: config.apiVersion,
    version: packageInfo.version
  };
}

async function checkDatabase() {
  if (!await testConnection()) {
    throw applicationError('DATABASE_UNAVAILABLE', 'Database connection failed');
  }
  return {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user
  };
}

module.exports = { getHealth, getApiInfo, checkDatabase };
