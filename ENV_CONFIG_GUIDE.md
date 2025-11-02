# Environment Configuration Guide

## Overview

The NetZero project uses a **centralized environment configuration** system that supports both **development** and **production** modes from a single `.env` file. This approach makes deployment safer and more maintainable.

## Key Concepts

### 1. Deployment Mode Control

The `DEPLOYMENT_MODE` variable in `scripts/.env` controls whether the application runs in development or production:

```bash
# In scripts/.env
DEPLOYMENT_MODE=development  # or 'production'
```

### 2. Environment-Specific Variables

All environment variables have two versions:
- **`DEV_*`** prefix for development
- **`PROD_*`** prefix for production

Example:
```bash
# Development
DEV_DB_HOST=localhost
DEV_DB_PASSWORD=devpassword123

# Production  
PROD_DB_HOST=mysql
PROD_DB_PASSWORD=secure_production_password
```

### 3. Automatic Selection

Each service automatically selects the correct variables based on `DEPLOYMENT_MODE`:

```javascript
// In server code (env.js)
const prefix = isProduction ? 'PROD_' : 'DEV_';
const dbHost = getEnvVar('DB_HOST'); // Returns DEV_DB_HOST or PROD_DB_HOST
```

## File Structure

```
netzero-project/
├── scripts/
│   └── .env                          # Main environment file
├── netzero-server/
│   └── src/config/
│       ├── env.js                    # Environment helper (NEW)
│       └── database.js               # Uses env.js
├── netzero-chat-server/
│   └── src/config/
│       ├── env.js                    # Environment helper (NEW)
│       └── database.js               # Uses env.js
└── netzero-client/
    └── src/api/
        └── client.js                 # Uses REACT_APP_* vars
```

## Configuration Files

### 1. Main Server (`netzero-server/src/config/env.js`)

**Purpose**: Central configuration for the main API server

**Features**:
- Automatically detects development/production mode
- Selects appropriate database credentials
- Validates required configuration
- Logs configuration on startup (hides passwords)

**Usage**:
```javascript
const config = require('./src/config/env');

console.log(config.database.host);  // 'localhost' or 'mysql'
console.log(config.jwt.secret);     // Development or production JWT secret
console.log(config.isProduction);   // true/false
```

### 2. Chat Server (`netzero-chat-server/src/config/env.js`)

**Purpose**: Central configuration for the chat server

**Features**: Same as main server, but for chat-specific variables

**Usage**: Same pattern as main server

### 3. React Client (`netzero-client/src/api/client.js`)

**Purpose**: API client configuration

**How it works**:
- Environment variables are injected at **build time** by Docker
- Docker Compose passes the correct `REACT_APP_*` variables based on mode
- Variables are embedded in the built JavaScript bundle

## Docker Integration

### Docker Compose

The `docker-compose.yml` file automatically passes environment variables to each service:

```yaml
services:
  netzero-server:
    environment:
      DEPLOYMENT_MODE: ${DEPLOYMENT_MODE:-development}
      # Development variables
      DEV_DB_HOST: ${DEV_DB_HOST}
      DEV_DB_PASSWORD: ${DEV_DB_PASSWORD}
      # Production variables
      PROD_DB_HOST: ${PROD_DB_HOST}
      PROD_DB_PASSWORD: ${PROD_DB_PASSWORD}
```

The service's `env.js` file then selects the correct set based on `DEPLOYMENT_MODE`.

### React Client Build

React environment variables are passed as build arguments:

```yaml
netzero-client:
  build:
    args:
      - REACT_APP_API_BASE_URL=${PROD_REACT_APP_API_BASE_URL:-${DEV_REACT_APP_API_BASE_URL}}
```

The `:-` syntax means: "Use PROD version, fallback to DEV if not set"

## Usage Scenarios

### Local Development

1. **Set development mode** in `scripts/.env`:
   ```bash
   DEPLOYMENT_MODE=development
   ```

2. **Start services**:
   ```bash
   cd scripts
   ./start.sh
   ```

3. **Services use**:
   - Database: `localhost:3306`
   - API URLs: `http://localhost:3001/api`
   - Dev passwords and JWT secrets

### Remote Production Deployment

1. **Configure production variables** in `scripts/.env`:
   ```bash
   PROD_DB_PASSWORD=secure_password
   PROD_JWT_SECRET=secure_jwt_secret
   ```

2. **Run remote deployment**:
   ```bash
   cd scripts
   ./remote-deploy.sh
   ```

3. **Automatic behavior**:
   - Script **forces** `DEPLOYMENT_MODE=production`
   - Creates production `.env` file
   - Uploads to remote server
   - Server uses production database and credentials

### Manual Production Mode Locally

To test production configuration locally:

1. **Change mode**:
   ```bash
   # In scripts/.env
   DEPLOYMENT_MODE=production
   ```

2. **Update production variables** to point to localhost:
   ```bash
   PROD_DB_HOST=localhost  # Instead of 'mysql'
   ```

3. **Start services**:
   ```bash
   ./start.sh
   ```

## Environment Variables Reference

### Deployment Control

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `DEPLOYMENT_MODE` | `development`, `production` | `development` | Controls which variable set is used |

### React Client

| Base Variable | Development | Production | Description |
|--------------|-------------|------------|-------------|
| `REACT_APP_API_BASE_URL` | `DEV_REACT_APP_API_BASE_URL` | `PROD_REACT_APP_API_BASE_URL` | Main API endpoint |
| `REACT_APP_CHAT_API_BASE_URL` | `DEV_REACT_APP_CHAT_API_BASE_URL` | `PROD_REACT_APP_CHAT_API_BASE_URL` | Chat API endpoint |
| `REACT_APP_USE_REAL_TREE_API` | `DEV_REACT_APP_USE_REAL_TREE_API` | `PROD_REACT_APP_USE_REAL_TREE_API` | Use real API vs mock |
| `REACT_APP_ENABLE_API_LOGGING` | `DEV_REACT_APP_ENABLE_API_LOGGING` | `PROD_REACT_APP_ENABLE_API_LOGGING` | Console logging |

### Main Server

| Base Variable | Development | Production | Description |
|--------------|-------------|------------|-------------|
| `DB_HOST` | `DEV_DB_HOST` | `PROD_DB_HOST` | Database hostname |
| `DB_PORT` | `DEV_DB_PORT` | `PROD_DB_PORT` | Database port |
| `DB_USER` | `DEV_DB_USER` | `PROD_DB_USER` | Database username |
| `DB_PASSWORD` | `DEV_DB_PASSWORD` | `PROD_DB_PASSWORD` | Database password |
| `DB_NAME` | `DEV_DB_NAME` | `PROD_DB_NAME` | Database name |
| `JWT_SECRET` | `DEV_JWT_SECRET` | `PROD_JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | `DEV_JWT_EXPIRES_IN` | `PROD_JWT_EXPIRES_IN` | JWT expiration |
| `CORS_ORIGIN` | `DEV_CORS_ORIGIN` | `PROD_CORS_ORIGIN` | Allowed CORS origins |

### Chat Server

Similar to Main Server, but with `CHAT_` prefix:
- `CHAT_DB_HOST` → `DEV_CHAT_DB_HOST` / `PROD_CHAT_DB_HOST`
- `CHAT_JWT_SECRET` → `DEV_CHAT_JWT_SECRET` / `PROD_CHAT_JWT_SECRET`
- etc.

### MySQL Container

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `MYSQL_ROOT_PASSWORD` | `DEV_MYSQL_ROOT_PASSWORD` | `PROD_MYSQL_ROOT_PASSWORD` | Root password |
| `MYSQL_DATABASE` | `DEV_MYSQL_DATABASE` | `PROD_MYSQL_DATABASE` | Database name |
| `MYSQL_USER` | `DEV_MYSQL_USER` | `PROD_MYSQL_USER` | Application user |
| `MYSQL_PASSWORD` | `DEV_MYSQL_PASSWORD` | `PROD_MYSQL_PASSWORD` | Application password |

## Security Best Practices

### 1. Never Commit Production Secrets

```bash
# .gitignore already includes:
scripts/.env
.env
```

### 2. Use Strong Production Passwords

Development passwords can be simple, but production **must** be secure:

```bash
# ❌ Bad
PROD_DB_PASSWORD=password123

# ✅ Good
PROD_DB_PASSWORD=X7k$mN9#pL2@qR5wT8v
```

### 3. Different JWT Secrets

Never reuse JWT secrets between environments:

```bash
DEV_JWT_SECRET=dev_secret_for_local_testing_only
PROD_JWT_SECRET=9k3L$mN7#pQ2@rR5wT8vX4bY6zA1cD
```

### 4. Validate Configuration

The `env.js` files validate required variables on startup:

```javascript
// Throws error in production if missing
validateConfig();
```

## Troubleshooting

### "Missing required environment variables"

**Cause**: Required variables not set in `scripts/.env`

**Solution**: 
1. Check `scripts/.env.example` for required variables
2. Set `DEV_*` or `PROD_*` versions depending on mode
3. Ensure no typos in variable names

### Services using wrong environment

**Check**:
```bash
# View what mode is active
docker-compose logs netzero-server | grep "Environment Mode"
# Should show: "Environment Mode: DEVELOPMENT" or "PRODUCTION"
```

**Fix**:
```bash
# Update DEPLOYMENT_MODE in scripts/.env
DEPLOYMENT_MODE=production  # or 'development'

# Rebuild containers
docker-compose --env-file scripts/.env up -d --build
```

### React app not connecting to API

**Cause**: API URL not set correctly at build time

**Solution**:
```bash
# Check what was built
docker-compose logs netzero-client

# Rebuild with correct environment
docker-compose --env-file scripts/.env up -d --build netzero-client
```

### Database connection fails

**Check**:
1. Correct `DEPLOYMENT_MODE` is set
2. Database password matches between:
   - `DEV_DB_PASSWORD` / `PROD_DB_PASSWORD`
   - `DEV_MYSQL_PASSWORD` / `PROD_MYSQL_PASSWORD`
3. Database host is correct:
   - Development: `localhost`
   - Production (Docker): `mysql`

## Advanced: Adding New Environment Variables

### 1. Add to `.env` file

```bash
# In scripts/.env
DEV_MY_NEW_VAR=dev_value
PROD_MY_NEW_VAR=prod_value
```

### 2. Update `docker-compose.yml`

```yaml
netzero-server:
  environment:
    DEV_MY_NEW_VAR: ${DEV_MY_NEW_VAR}
    PROD_MY_NEW_VAR: ${PROD_MY_NEW_VAR}
```

### 3. Update `env.js`

```javascript
const config = {
  myNewVar: getEnvVar('MY_NEW_VAR', 'default_value')
};
```

### 4. Use in application

```javascript
const config = require('./config/env');
console.log(config.myNewVar);
```

## Summary

✅ **Single `.env` file** controls all environments  
✅ **Automatic selection** of dev/prod variables  
✅ **Type-safe configuration** via `env.js` helpers  
✅ **Validation** on startup prevents missing variables  
✅ **Remote deployment** automatically forces production mode  
✅ **No secrets in code** - all in centralized `.env`

This system ensures:
- **Safety**: Production credentials never used in development
- **Simplicity**: One file to manage all configuration
- **Flexibility**: Easy to switch between modes
- **Security**: Validated, centralized secret management
