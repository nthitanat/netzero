/**
 * Environment Configuration Helper for Chat Server
 * Reads variables injected by the selected Compose environment file.
 */

const DEPLOYMENT_MODE = process.env.NODE_ENV || 'development';
const isProduction = DEPLOYMENT_MODE === 'production';
const isDevelopment = DEPLOYMENT_MODE === 'development';

console.log(`🌍 Chat Server Environment Mode: ${DEPLOYMENT_MODE.toUpperCase()}`);

/**
 * Get an environment variable or its application default.
 * @param {string} key - The variable name
 * @param {*} defaultValue - Default value if not found
 * @returns {*} The environment variable value
 */
function getEnvVar(key, defaultValue = undefined) {
  return process.env[key] ?? defaultValue;
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
  bodyLimit: getEnvVar('CHAT_HTTP_BODY_LIMIT', '10mb'),
  
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
    secret: getEnvVar('CHAT_JWT_SECRET', getEnvVar('JWT_SECRET')),
    expiresIn: getEnvVar('CHAT_JWT_EXPIRES_IN', '24h')
  },

  cors: {
    origins: getEnvVar('CHAT_CORS_ORIGINS', 'http://localhost:3000').split(',').map(origin => origin.trim())
  },

  welcomeChat: {
    vectorStoreId: getEnvVar('CHAT_VECTOR_STORE_ID'),
    model: getEnvVar('CHAT_WELCOME_MODEL', 'gpt-4.1'),
    maxTokens: Number(getEnvVar('CHAT_WELCOME_MAX_TOKENS', '2048')),
    maxMessageLength: Number(getEnvVar('CHAT_MAX_MESSAGE_LENGTH', '1000')),
    maxChatIdLength: Number(getEnvVar('CHAT_MAX_ID_LENGTH', '255')),
    rateLimitMax: Number(getEnvVar('CHAT_RATE_LIMIT_MAX', '100')),
    rateLimitWindowMs: Number(getEnvVar('CHAT_RATE_LIMIT_WINDOW_MS', '60000'))
  },

  productSurvey: {
    model: getEnvVar('CHAT_SURVEY_MODEL', 'gpt-4o'),
    maxOutputTokens: Number(getEnvVar('CHAT_SURVEY_MAX_OUTPUT_TOKENS', '4000'))
  },
  
  // OpenAI configuration
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY')
  }
};

// Validate required configuration
function validateConfig() {
  const required = [
    'database.password',
    'jwt.secret',
    'openai.apiKey',
    'welcomeChat.vectorStoreId'
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
  },
  openai: {
    apiKey: config.openai.apiKey ? '***' : 'NOT SET'
  }
});

module.exports = config;
