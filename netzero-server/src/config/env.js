/**
 * Environment Configuration Helper
 * Reads variables injected by the selected Compose environment file.
 */

const DEPLOYMENT_MODE = process.env.NODE_ENV || 'development';
const isProduction = DEPLOYMENT_MODE === 'production';
const isDevelopment = DEPLOYMENT_MODE === 'development';

console.log(`🌍 Environment Mode: ${DEPLOYMENT_MODE.toUpperCase()}`);

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
  port: process.env.PORT || 3001,
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  bodyLimit: getEnvVar('HTTP_BODY_LIMIT', '10mb'),

  pagination: {
    defaultPageSize: Number(getEnvVar('DEFAULT_PAGE_SIZE', '50')),
    userPageSize: Number(getEnvVar('USER_PAGE_SIZE', '20')),
    maxPageSize: Number(getEnvVar('MAX_PAGE_SIZE', '100'))
  },

  cache: {
    imageMaxAgeSeconds: Number(getEnvVar('IMAGE_CACHE_SECONDS', '86400'))
  },
  
  // Database configuration
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: parseInt(getEnvVar('DB_PORT', '3306')),
    user: getEnvVar('DB_USER', 'netzeroadmin'),
    password: getEnvVar('DB_PASSWORD'),
    database: getEnvVar('DB_NAME', 'netzero'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // JWT configuration
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d')
  },

  auth: {
    bcryptSaltRounds: Number(getEnvVar('BCRYPT_SALT_ROUNDS', '12'))
  },

  rateLimit: {
    apiWindowMs: Number(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')),
    apiMax: Number(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100')),
    devApiMax: Number(getEnvVar('RATE_LIMIT_DEV_MAX_REQUESTS', '1000')),
    authWindowMs: Number(getEnvVar('AUTH_RATE_LIMIT_WINDOW_MS', '900000')),
    authMax: Number(getEnvVar('AUTH_RATE_LIMIT_MAX_REQUESTS', '5'))
  },

  survey: {
    analyticsTextLimit: Number(getEnvVar('SURVEY_ANALYTICS_TEXT_LIMIT', '50')),
    maxPageSize: Number(getEnvVar('SURVEY_MAX_PAGE_SIZE', '1000'))
  },
  
  // File upload configuration
  upload: {
    dir: process.env.UPLOAD_DIR || './files',
    maxSize: Number(getEnvVar('MAX_FILE_SIZE', '104857600')),
    maxFiles: Number(getEnvVar('MAX_UPLOAD_FILES', '10'))
  },
  
  // CORS configuration
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000').split(',').map(origin => origin.trim()),
    maxAgeSeconds: Number(getEnvVar('CORS_MAX_AGE_SECONDS', '86400'))
  },

  // SurveyMonkey / Glocal check-in configuration
  surveyMonkey: {
    accessToken: getEnvVar('SURVEYMONKEY_ACCESS_TOKEN'),
    surveyId: getEnvVar('SURVEYMONKEY_SURVEY_ID'),
    redirectUrl: getEnvVar('SURVEYMONKEY_SURVEY_REDIRECT_URL'),
    webhookSecret: getEnvVar('SURVEYMONKEY_WEBHOOK_SECRET'),
    baseUrl: getEnvVar('SURVEYMONKEY_BASE_URL', 'https://api.surveymonkey.com/v3'),
    syncTtlMs: Number(getEnvVar('SURVEYMONKEY_SYNC_TTL_MS', '60000')),
    emailScanPageSize: Number(getEnvVar('SURVEYMONKEY_EMAIL_SCAN_PAGE_SIZE', '100')),
    emailScanMaxPages: Number(getEnvVar('SURVEYMONKEY_EMAIL_SCAN_MAX_PAGES', '10'))
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
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    if (isProduction) {
      throw new Error('Missing required production environment variables');
    } else {
      console.warn('⚠️  Using development mode with missing variables');
    }
  }
}

// Validate on load
validateConfig();

// Log configuration (hide sensitive data)
console.log('📋 Configuration loaded:', {
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
  cors: config.cors.origin
});

module.exports = config;
