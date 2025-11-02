# NetZero Docker Deployment - Quick Reference

## 📋 What Was Created

### Docker Files
- ✅ `docker-compose.yml` - Orchestrates all services (MySQL, API, Chat, Client)
- ✅ `netzero-client/Dockerfile` - React app with nginx
- ✅ `netzero-client/nginx.conf` - Nginx configuration
- ✅ `netzero-server/Dockerfile` - Main API server
- ✅ `netzero-chat-server/Dockerfile` - Chat server
- ✅ `.dockerignore` files for all services

### Environment & Configuration
- ✅ `scripts/.env` - **Centralized environment variables** (UPDATE THIS!)
- ✅ `scripts/.env.example` - Template for environment variables

### Deployment Scripts
- ✅ `scripts/deploy.sh` - Build React locally (existing, updated)
- ✅ `scripts/remote-deploy.sh` - **Full remote deployment**
- ✅ `scripts/connect-vpn.sh` - Connect to Chula VPN
- ✅ `scripts/disconnect-vpn.sh` - Disconnect from VPN
- ✅ `scripts/start.sh` - Quick start for local development
- ✅ `scripts/stop.sh` - Stop all containers

### Documentation
- ✅ `DOCKER_README.md` - Complete Docker deployment guide

## 🚀 Quick Start

### 1. Local Development
```bash
# Configure environment
cd scripts
cp .env.example .env
# Edit .env with your settings
vi .env

# Start application
./start.sh

# View logs
docker-compose logs -f

# Stop application
./stop.sh
```

### 2. Remote Deployment
```bash
# IMPORTANT: Update scripts/.env with:
# - VPN credentials (vpn.chula.ac.th)
# - Remote server credentials (161.200.199.67)
# - Database passwords
# - JWT secrets

cd scripts
./remote-deploy.sh
```

## ⚙️ Configuration Required

### Edit `scripts/.env` before deploying:

```bash
# VPN Credentials
VPN_HOST=vpn.chula.ac.th
VPN_USERNAME=njaitip
VPN_PASSWORD=Charlie04!

# Remote Server
REMOTE_HOST=161.200.199.67
REMOTE_USER=adminroot
REMOTE_PASSWORD=tZ#A,2]@KdGJ

# Database Passwords (CHANGE IN PRODUCTION!)
DB_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=root_secure_password_here

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your_jwt_secret_min_32_characters
CHAT_JWT_SECRET=your_chat_jwt_secret_min_32_characters
```

## 🔐 Security Notes

⚠️ **IMPORTANT**: The `.env` file contains sensitive credentials:
- Never commit `scripts/.env` to git
- Change all default passwords before production
- Use strong JWT secrets (min 32 characters)
- Secure VPN and SSH credentials

## 📦 What `remote-deploy.sh` Does

1. ✅ Connects to Chula VPN (`vpn.chula.ac.th`)
2. ✅ Builds React app locally using `deploy.sh`
3. ✅ Creates deployment package with all files
4. ✅ Uploads to remote server (161.200.199.67)
5. ✅ Stops existing Docker containers
6. ✅ Deploys new version with Docker Compose
7. ✅ Verifies all services are running
8. ✅ Shows access URLs

## 🌐 Service Endpoints

After deployment, access at:
- **Web Client**: http://161.200.199.67 (or http://localhost:3000 local)
- **API Server**: http://161.200.199.67:3001/api/v1
- **Chat Server**: http://161.200.199.67:3004/api/v1

## 🐳 Docker Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| MySQL | netzero-mysql | 3306 | Database |
| API Server | netzero-server | 3001 | Main API |
| Chat Server | netzero-chat-server | 3004 | Chat API |
| Web Client | netzero-client | 80, 3000 | React App |

## 🛠️ Common Commands

```bash
# Start local development
cd scripts && ./start.sh

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart netzero-server

# Rebuild a service
docker-compose up -d --build netzero-server

# Stop everything
cd scripts && ./stop.sh

# Deploy to remote server
cd scripts && ./remote-deploy.sh

# Connect to VPN manually
cd scripts && ./connect-vpn.sh

# Disconnect from VPN
cd scripts && ./disconnect-vpn.sh
```

## 🔍 Troubleshooting

### VPN Connection Issues
```bash
# Check if VPN is connected
pgrep openconnect

# Connect manually
cd scripts && ./connect-vpn.sh

# Disconnect
cd scripts && ./disconnect-vpn.sh
```

### Docker Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs netzero-server

# Restart containers
docker-compose restart

# Clean rebuild
docker-compose down
docker-compose up -d --build
```

### Remote Server Issues
```bash
# Test connection
ping 161.200.199.67

# SSH manually
ssh adminroot@161.200.199.67

# View remote logs
ssh adminroot@161.200.199.67 "cd /opt/netzero && docker-compose logs"
```

## 📝 Prerequisites

### Local Machine
- Docker Desktop installed and running
- Git
- Bash shell

### For Remote Deployment
- `openconnect` (VPN client) - auto-installed by script
- `sshpass` (SSH automation) - auto-installed by script

### Remote Server
- Docker and Docker Compose installed
- SSH access
- Firewall configured for ports 80, 3001, 3004

## 📚 Documentation

- **Full Guide**: See `DOCKER_README.md`
- **Deploy Script**: See `scripts/deploy.sh`
- **Remote Deploy**: See `scripts/remote-deploy.sh`

## 🆘 Need Help?

1. Check `DOCKER_README.md` for detailed documentation
2. View logs: `docker-compose logs -f`
3. Verify configuration in `scripts/.env`
4. Ensure VPN is connected for remote access

---

**Created**: November 2, 2025
**Project**: NetZero
**Environment**: Docker + Docker Compose
