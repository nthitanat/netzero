# NetZero Docker Deployment Guide

This directory contains Docker configuration and deployment scripts for the NetZero project.

## 📁 Project Structure

```
netzero-project/
├── docker-compose.yml           # Main orchestration file
├── scripts/
│   ├── .env                     # Centralized environment variables
│   ├── deploy.sh               # Local build script
│   ├── remote-deploy.sh        # Remote deployment script
│   ├── connect-vpn.sh          # VPN connection script
│   └── disconnect-vpn.sh       # VPN disconnection script
├── netzero-client/
│   ├── Dockerfile              # React app containerization
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore
├── netzero-server/
│   ├── Dockerfile              # Main API server
│   └── .dockerignore
└── netzero-chat-server/
    ├── Dockerfile              # Chat server
    └── .dockerignore
```

## 🚀 Quick Start

### Local Development with Docker

1. **Configure environment variables**:
   ```bash
   cd scripts
   # Edit .env file with your configuration
   vi .env
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up -d --build
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

### Remote Deployment

1. **Make scripts executable**:
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Configure credentials in scripts/.env**:
   - Update VPN credentials
   - Update remote server credentials
   - Update database passwords
   - Update JWT secrets

3. **Run remote deployment**:
   ```bash
   cd scripts
   ./remote-deploy.sh
   ```

This will:
- Connect to Chula VPN
- Build React application locally
- Package deployment files
- Upload to remote server
- Deploy using Docker Compose
- Verify deployment

## 🐳 Docker Services

### MySQL Database
- **Container**: `netzero-mysql`
- **Port**: `3306`
- **Volume**: Persistent data storage
- **Init**: SQL scripts in `netzero-server/sql/`

### Main API Server
- **Container**: `netzero-server`
- **Port**: `3001`
- **Endpoint**: `http://localhost:3001/api/v1`
- **Health**: `http://localhost:3001/api/v1/health`

### Chat Server
- **Container**: `netzero-chat-server`
- **Port**: `3004`
- **Endpoint**: `http://localhost:3004/api/v1`
- **Health**: `http://localhost:3004/api/v1/health`

### React Client
- **Container**: `netzero-client`
- **Port**: `80` and `3000`
- **Served by**: Nginx
- **Health**: `http://localhost/health`

## 📝 Environment Variables

All environment variables are centralized in `scripts/.env`:

### React Client
- `REACT_APP_API_BASE_URL` - Main API endpoint
- `REACT_APP_CHAT_API_BASE_URL` - Chat API endpoint

### Servers
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port

### Deployment
- `VPN_HOST`, `VPN_USERNAME`, `VPN_PASSWORD` - VPN credentials
- `REMOTE_HOST`, `REMOTE_USER`, `REMOTE_PASSWORD` - Server credentials

## 🔐 VPN Connection

### Connect to VPN
```bash
cd scripts
./connect-vpn.sh
```

### Disconnect from VPN
```bash
cd scripts
./disconnect-vpn.sh
```

### Requirements
- **macOS**: `openconnect` (installed via Homebrew)
- **Linux**: `openconnect` (installed via apt/yum)

## 🛠️ Useful Commands

### View running containers
```bash
docker-compose ps
```

### View logs for specific service
```bash
docker-compose logs -f netzero-server
docker-compose logs -f netzero-client
docker-compose logs -f netzero-chat-server
```

### Rebuild specific service
```bash
docker-compose up -d --build netzero-server
```

### Access container shell
```bash
docker exec -it netzero-server sh
docker exec -it netzero-mysql bash
```

### View database
```bash
docker exec -it netzero-mysql mysql -u netzeroadmin -p netzero
```

### Clean up (remove volumes)
```bash
docker-compose down -v
```

## 🔍 Troubleshooting

### Container won't start
1. Check logs: `docker-compose logs <service-name>`
2. Verify environment variables in `scripts/.env`
3. Ensure ports are not in use: `lsof -i :3000`, `lsof -i :3001`, `lsof -i :3004`

### Database connection issues
1. Verify MySQL is healthy: `docker-compose ps`
2. Check database credentials in `.env`
3. Wait for MySQL to fully initialize (may take 30-60 seconds)

### VPN connection fails
1. Verify credentials in `scripts/.env`
2. Check if `openconnect` is installed
3. Ensure you have sudo privileges
4. Check VPN server is accessible

### Remote deployment fails
1. Verify VPN is connected
2. Test SSH connection: `ssh adminroot@161.200.199.67`
3. Check Docker is installed on remote server
4. Verify firewall allows connections

## 📦 Production Deployment

### Security Checklist
- [ ] Change all default passwords in `scripts/.env`
- [ ] Update JWT secrets
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up firewall rules
- [ ] Configure backup strategy for MySQL volume
- [ ] Set up monitoring and logging

### Recommended Setup
1. Use Docker Swarm or Kubernetes for production
2. Set up reverse proxy (nginx/traefik) with SSL
3. Implement automated backups
4. Configure log aggregation
5. Set up monitoring (Prometheus + Grafana)

## 🔄 Updates and Maintenance

### Update application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup database
```bash
docker exec netzero-mysql mysqldump -u netzeroadmin -p netzero > backup-$(date +%Y%m%d).sql
```

### Restore database
```bash
docker exec -i netzero-mysql mysql -u netzeroadmin -p netzero < backup.sql
```

## 📞 Support

For issues or questions:
1. Check container logs: `docker-compose logs`
2. Verify configuration in `scripts/.env`
3. Review this documentation
4. Contact NetZero Team

## 📄 License

NetZero Project - Internal Use
