const os = require('os');
const { testConnection } = require('../config/database');
const config = require('../config/env');

function getServerInfo({ timestamp = new Date().toISOString(), roundUptime = false } = {}) {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: roundUptime ? Math.floor(process.uptime()) : process.uptime(),
    environment: config.env,
    serverTime: timestamp,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

function getConnectionInfo({ client }) {
  return {
    message: 'Connection test successful',
    client,
    server: getServerInfo(),
    status: 'connected'
  };
}

async function checkDatabase() {
  const startedAt = Date.now();
  const isConnected = await testConnection();
  return {
    isConnected,
    connectionTime: `${Date.now() - startedAt}ms`,
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user
  };
}

async function getSystemStatus({ client }) {
  const database = await checkDatabase();
  const timestamp = new Date().toISOString();
  const memory = process.memoryUsage();
  return {
    isHealthy: database.isConnected,
    status: database.isConnected ? 'healthy' : 'degraded',
    timestamp,
    data: {
      server: getServerInfo({ timestamp, roundUptime: true }),
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024),
        total: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024)
      },
      system: {
        loadAvg: os.loadavg(),
        cpus: os.cpus().length,
        freeMem: Math.round(os.freemem() / 1024 / 1024),
        totalMem: Math.round(os.totalmem() / 1024 / 1024)
      },
      database: {
        connected: database.isConnected,
        connectionTime: database.connectionTime,
        host: database.host,
        port: database.port,
        database: database.database
      },
      client
    }
  };
}

function ping({ requestId }) {
  return {
    message: 'pong',
    timestamp: new Date().toISOString(),
    requestId,
    serverTime: Date.now()
  };
}

function echo(requestInfo) {
  return requestInfo;
}

module.exports = { getConnectionInfo, checkDatabase, getSystemStatus, ping, echo };
