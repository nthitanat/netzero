const config = require('../config/env');
const { testConnection } = require('../config/database');
const { applicationError } = require('../errors/applicationError');
const packageInfo = require('../../package.json');

function getHealth() {
  return {
    service: 'netzero-chat-server',
    environment: config.env,
    version: packageInfo.version,
    port: config.port,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
}

function getApiInfo() {
  return {
    apiPrefix: config.apiPrefix,
    apiVersion: config.apiVersion,
    version: packageInfo.version,
    rateLimitMax: config.welcomeChat.rateLimitMax,
    rateLimitWindowMs: config.welcomeChat.rateLimitWindowMs
  };
}

async function checkDatabase() {
  if (!await testConnection()) {
    throw applicationError('DATABASE_UNAVAILABLE', 'Chat Server - Database connection failed');
  }
  return {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user
  };
}

module.exports = { getHealth, getApiInfo, checkDatabase };
