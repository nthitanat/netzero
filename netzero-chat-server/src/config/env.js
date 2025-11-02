/**
 * Environment Configuration Helper for Chat Server
 * Automatically selects development or production environment variables
 */

require('dotenv').config();

// Determine deployment mode
const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || process.env.NODE_ENV || 'development';
const isProduction = DEPLOYMENT_MODE === 'production';
const isDevelopment = DEPLOYMENT_MODE === 'development';

console.log(`🌍 Chat Server Environment Mode: ${DEPLOYMENT_MODE.toUpperCase()}`);

/**
 * Get environment variable with dev/prod prefix
 * @param {string} key - The base key name (without DEV_ or PROD_ prefix)
 * @param {*} defaultValue - Default value if not found
 * @returns {*} The environment variable value
 */
function getEnvVar(key, defaultValue = undefined) {
  const prefix = isProduction ? 'PROD_' : 'DEV_';
  const prefixedKey = prefix + key;
  
  // First try prefixed version
  if (process.env[prefixedKey] !== undefined) {
    return process.env[prefixedKey];
  }
  
  // Fall back to non-prefixed version
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  
  // Return default value
  return defaultValue;
}

// Export configuration object
const config = {
  // Environment info
  env: DEPLOYMENT_MODE,
  isProduction,
  isDevelopment,
  
  // Server configuration
  port: process.env.CHAT_PORT || 3004,
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Database configuration
  database: {
    host: getEnvVar('CHAT_DB_HOST', 'localhost'),
    port: parseInt(getEnvVar('CHAT_DB_PORT', '3306')),
    user: getEnvVar('CHAT_DB_USER', 'netzeroadmin'),
    password: getEnvVar('CHAT_DB_PASSWORD'),
    database: getEnvVar('CHAT_DB_NAME', 'netzero'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // JWT configuration
  jwt: {
    secret: getEnvVar('CHAT_JWT_SECRET'),
    expiresIn: getEnvVar('CHAT_JWT_EXPIRES_IN', '24h')
  }
};

// Validate required configuration
function validateConfig() {
  const required = [
    'database.password',
    'jwt.secret'
  ];
  
  const missing = [];
  
  for (const path of required) {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        missing.push(path);
        break;
      }
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Chat Server - Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    if (isProduction) {
      throw new Error('Missing required production environment variables');
    } else {
      console.warn('⚠️  Chat Server - Using development mode with missing variables');
    }
  }
}

// Validate on load
validateConfig();

// Log configuration (hide sensitive data)
console.log('📋 Chat Server Configuration loaded:', {
  env: config.env,
  port: config.port,
  database: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    database: config.database.database,
    password: config.database.password ? '***' : 'NOT SET'
  },
  jwt: {
    secret: config.jwt.secret ? '***' : 'NOT SET',
    expiresIn: config.jwt.expiresIn
  }
});

module.exports = config;
