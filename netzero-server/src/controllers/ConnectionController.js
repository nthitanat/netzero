const ConnectionService = require('../services/ConnectionService');
const { sendSuccess } = require('../middleware/response');

function getClientInfo(req) {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    host: req.get('Host'),
    referer: req.get('Referer'),
    acceptLanguage: req.get('Accept-Language'),
    requestId: req.requestId ?? req.id
  };
}

function testConnection(req, res) {
  const data = ConnectionService.getConnectionInfo({ client: getClientInfo(req) });
  return sendSuccess(res, { message: 'Remote connection established successfully', data });
}

async function testDatabaseConnection(req, res) {
  const database = await ConnectionService.checkDatabase();
  if (!database.isConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      data: {
        database: { status: 'disconnected', connectionTime: database.connectionTime },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  }
  return sendSuccess(res, {
    message: 'Database connection successful',
    data: {
      database: {
        status: 'connected',
        host: database.host,
        port: database.port,
        database: database.database,
        user: database.user,
        connectionTime: database.connectionTime
      },
      timestamp: new Date().toISOString()
    }
  });
}

async function getSystemStatus(req, res) {
  const result = await ConnectionService.getSystemStatus({ client: getClientInfo(req) });
  return res.status(result.isHealthy ? 200 : 503).json({
    success: result.isHealthy,
    message: `System status: ${result.status}`,
    status: result.status,
    data: result.data,
    timestamp: result.timestamp
  });
}

function ping(req, res) {
  const data = ConnectionService.ping({ requestId: req.requestId ?? req.id });
  return sendSuccess(res, { message: 'Ping successful', data });
}

function echo(req, res) {
  const data = ConnectionService.echo({
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
    requestId: req.requestId ?? req.id
  });
  return sendSuccess(res, { message: 'Echo response', data });
}

module.exports = { testConnection, testDatabaseConnection, getSystemStatus, ping, echo };
