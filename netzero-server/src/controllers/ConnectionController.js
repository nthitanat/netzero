/**
 * Connection Controller
 * Handles connection testing and diagnostic endpoints
 */

const { testConnection } = require('../config/database');
const os = require('os');

class ConnectionController {
  /**
   * Test basic connection from remote
   * GET /api/v1/connection/test
   */
  static async testConnection(req, res) {
    try {
      const timestamp = new Date().toISOString();
      const clientInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        origin: req.get('Origin'),
        host: req.get('Host'),
        referer: req.get('Referer'),
        acceptLanguage: req.get('Accept-Language'),
        requestId: req.requestId
      };

      const serverInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        serverTime: timestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      res.success({
        message: 'Connection test successful',
        client: clientInfo,
        server: serverInfo,
        status: 'connected'
      }, 'Remote connection established successfully');

    } catch (error) {
      console.error('Connection test error:', error);
      res.error('Connection test failed', 500, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test database connectivity specifically
   * GET /api/v1/connection/database
   */
  static async testDatabaseConnection(req, res) {
    try {
      const startTime = Date.now();
      const isConnected = await testConnection();
      const connectionTime = Date.now() - startTime;

      if (isConnected) {
        res.success({
          database: {
            status: 'connected',
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            connectionTime: `${connectionTime}ms`
          },
          timestamp: new Date().toISOString()
        }, 'Database connection successful');
      } else {
        res.error('Database connection failed', 503, {
          database: {
            status: 'disconnected',
            connectionTime: `${connectionTime}ms`
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Database connection test error:', error);
      res.error('Database connection test failed', 500, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Comprehensive system status check
   * GET /api/v1/connection/status
   */
  static async getSystemStatus(req, res) {
    try {
      const timestamp = new Date().toISOString();
      
      // Test database connection
      const dbStartTime = Date.now();
      const isDatabaseConnected = await testConnection();
      const dbConnectionTime = Date.now() - dbStartTime;

      // System information
      const systemInfo = {
        server: {
          hostname: os.hostname(),
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          uptime: Math.floor(process.uptime()),
          environment: process.env.NODE_ENV || 'development',
          serverTime: timestamp,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        system: {
          loadAvg: os.loadavg(),
          cpus: os.cpus().length,
          freeMem: Math.round(os.freemem() / 1024 / 1024),
          totalMem: Math.round(os.totalmem() / 1024 / 1024)
        },
        database: {
          connected: isDatabaseConnected,
          connectionTime: `${dbConnectionTime}ms`,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME
        },
        client: {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          origin: req.get('Origin'),
          host: req.get('Host'),
          requestId: req.requestId
        }
      };

      const overallStatus = isDatabaseConnected ? 'healthy' : 'degraded';
      const statusCode = isDatabaseConnected ? 200 : 503;

      res.status(statusCode).json({
        success: isDatabaseConnected,
        message: `System status: ${overallStatus}`,
        status: overallStatus,
        data: systemInfo,
        timestamp
      });

    } catch (error) {
      console.error('System status check error:', error);
      res.error('System status check failed', 500, {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Simple ping endpoint for basic connectivity
   * GET /api/v1/connection/ping
   */
  static ping(req, res) {
    res.success({
      message: 'pong',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      serverTime: Date.now()
    }, 'Ping successful');
  }

  /**
   * Echo endpoint that returns request details
   * GET/POST /api/v1/connection/echo
   */
  static echo(req, res) {
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      params: req.params,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };

    res.success(requestInfo, 'Echo response');
  }
}

module.exports = ConnectionController;
