# 🚀 Quick Reference - Environment Configuration

## File Locations

```
scripts/.env                              # ⭐ Main environment config (EDIT THIS)
scripts/.env.example                      # Template
netzero-server/src/config/env.js         # Auto-selects dev/prod vars
netzero-chat-server/src/config/env.js    # Auto-selects dev/prod vars
netzero-client/src/api/client.js         # Uses build-time injection
```

## Deployment Mode Control

```bash
# In scripts/.env
DEPLOYMENT_MODE=development   # Local development
DEPLOYMENT_MODE=production    # Production deployment
```

## Variable Naming Pattern

```bash
# Development variables (prefix with DEV_)
DEV_DB_HOST=localhost
DEV_DB_PASSWORD=devpass123
DEV_JWT_SECRET=dev_secret

# Production variables (prefix with PROD_)
PROD_DB_HOST=mysql
PROD_DB_PASSWORD=secure_prod_password
PROD_JWT_SECRET=secure_prod_jwt_secret
```

## How It Works

1. **Set mode** in `scripts/.env`:
   ```bash
   DEPLOYMENT_MODE=development
   ```

2. **Docker Compose** passes ALL variables (DEV_* and PROD_*) to containers

3. **Each service** (`env.js`) automatically selects correct set:
   ```javascript
   // In env.js
   const prefix = isProduction ? 'PROD_' : 'DEV_';
   const dbHost = getEnvVar('DB_HOST'); // Returns DEV_DB_HOST or PROD_DB_HOST
   ```

4. **React client** gets variables at build time via Docker build args

## Quick Commands

### Local Development
```bash
# 1. Edit scripts/.env
DEPLOYMENT_MODE=development

# 2. Start services
cd scripts && ./start.sh

# 3. View logs
docker-compose --env-file scripts/.env logs -f
```

### Production Deployment
```bash
# 1. Configure prod variables in scripts/.env
PROD_DB_PASSWORD=secure_password
PROD_JWT_SECRET=secure_jwt_secret

# 2. Deploy (automatically forces production mode)
cd scripts && ./remote-deploy.sh
```

### Switch Mode Locally
```bash
# 1. Change mode in scripts/.env
DEPLOYMENT_MODE=production

# 2. Rebuild
docker-compose --env-file scripts/.env up -d --build
```

## Configuration Checklist

### Development Setup
- [ ] `DEPLOYMENT_MODE=development`
- [ ] `DEV_DB_HOST=localhost` (or `mysql` if using Docker)
- [ ] `DEV_DB_PASSWORD=devpass123` (can be simple)
- [ ] `DEV_JWT_SECRET=dev_secret_min_32_chars`
- [ ] `DEV_REACT_APP_API_BASE_URL=http://localhost:3001/api`

### Production Setup
- [ ] `DEPLOYMENT_MODE=production` (auto-set by remote-deploy.sh)
- [ ] `PROD_DB_HOST=mysql` (container name)
- [ ] `PROD_DB_PASSWORD=STRONG_SECURE_PASSWORD`
- [ ] `PROD_JWT_SECRET=STRONG_SECURE_JWT_SECRET_MIN_32_CHARS`
- [ ] `PROD_REACT_APP_API_BASE_URL=http://161.200.199.67:3001/api`
- [ ] `PROD_MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD`

## Verification

### Check Active Mode
```bash
# View server logs to see which mode is active
docker-compose logs netzero-server | grep "Environment Mode"
# Output: "Environment Mode: DEVELOPMENT" or "PRODUCTION"
```

### Check Configuration
```bash
# View loaded configuration
docker-compose logs netzero-server | grep "Configuration loaded"
```

### Check Database Connection
```bash
# Main server
docker-compose logs netzero-server | grep "Database connected"

# Chat server
docker-compose logs netzero-chat-server | grep "Database connected"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing required variables" | Check `scripts/.env` has all DEV_* or PROD_* variables set |
| Wrong database used | Verify `DEPLOYMENT_MODE` in `scripts/.env` |
| API connection fails | Check `REACT_APP_API_BASE_URL` matches deployment mode |
| Container won't start | Run `docker-compose logs <service>` to see error |

## Security Reminders

⚠️ **NEVER commit** `scripts/.env` to git  
⚠️ **Use strong passwords** for production (min 16 chars, mixed case, symbols)  
⚠️ **Different JWT secrets** for dev and prod  
⚠️ **Rotate secrets** regularly in production

## Important Files Changed

### New Files Created
- ✅ `netzero-server/src/config/env.js` - Environment helper
- ✅ `netzero-chat-server/src/config/env.js` - Environment helper
- ✅ `ENV_CONFIG_GUIDE.md` - Full documentation

### Modified Files
- ✅ `scripts/.env` - Now has DEV_* and PROD_* variables
- ✅ `scripts/.env.example` - Updated template
- ✅ `netzero-server/src/config/database.js` - Uses env.js
- ✅ `netzero-chat-server/src/config/database.js` - Uses env.js
- ✅ `netzero-client/src/api/client.js` - Simplified
- ✅ `netzero-client/Dockerfile` - Accepts build args
- ✅ `docker-compose.yml` - Passes all variables
- ✅ `scripts/remote-deploy.sh` - Forces production mode
- ✅ `scripts/start.sh` - Uses scripts/.env
- ✅ `scripts/stop.sh` - Uses scripts/.env

## Summary

**Development**: Set `DEPLOYMENT_MODE=development`, uses `DEV_*` variables  
**Production**: Set `DEPLOYMENT_MODE=production`, uses `PROD_*` variables  
**Remote Deploy**: Automatically forces production mode  
**One File**: All config in `scripts/.env`  
**Type Safe**: Configuration validated on startup  
**Secure**: Secrets never in code, only in .env

For detailed explanations, see `ENV_CONFIG_GUIDE.md`
