# Docker & Deployment Guide

A general-purpose reference for containerizing applications and deploying them with shell scripts and environment variable management. The patterns here are adapted from this project but apply to any multi-service Node.js / React stack (or similar).

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Environment Variables (.env)](#2-environment-variables-env)
3. [Dockerfile Patterns](#3-dockerfile-patterns)
4. [docker-compose.yml](#4-docker-composeyml)
5. [Deploy Scripts](#5-deploy-scripts)
6. [Remote Deployment Workflow](#6-remote-deployment-workflow)
7. [Security Checklist](#7-security-checklist)
8. [Adapting to a Different Project Structure](#8-adapting-to-a-different-project-structure)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Project Structure Overview

A typical multi-service project that uses this pattern looks like:

```
my-project/
├── .env                  ← single source of truth for ALL secrets & config
├── .env.example          ← committed template with no real values
├── .gitignore            ← must include .env
├── docker-compose.yml    ← orchestrates all services
├── my-frontend/
│   ├── Dockerfile        ← multi-stage build (build + nginx)
│   └── nginx.conf
├── my-backend/
│   └── Dockerfile        ← Node.js / Python / etc.
├── my-other-service/
│   └── Dockerfile
└── scripts/
    ├── start.sh          ← local dev helper
    ├── stop.sh
    └── remote-deploy.sh  ← push to production server over SSH
```

**Key principle:** Every script and every Docker service reads from the single `.env` file at the project root. There is never a separate `.env` per sub-folder — that creates drift.

---

## 2. Environment Variables (.env)

### 2.1 The DEV/PROD Prefix Pattern

Instead of maintaining two `.env` files, one pattern used here is a **single `.env`** with `DEV_` and `PROD_` prefixes for environment-specific values, plus a `DEPLOYMENT_MODE` flag to switch between them:

```dotenv
# ============================================================
# DEPLOYMENT MODE — set to 'development' or 'production'
# remote-deploy.sh automatically overrides this to 'production'
# ============================================================
DEPLOYMENT_MODE=development

# ============================================================
# BACKEND — SHARED
# ============================================================
PORT=3001
API_PREFIX=/api
API_VERSION=v1

# ============================================================
# BACKEND — DEVELOPMENT
# ============================================================
DEV_DB_HOST=host.docker.internal   # reach host MySQL from inside Docker
DEV_DB_PORT=3306
DEV_DB_USER=myuser
DEV_DB_PASSWORD=changeme
DEV_DB_NAME=mydb
DEV_JWT_SECRET=local_dev_secret
DEV_JWT_EXPIRES_IN=24h
DEV_CORS_ORIGIN=http://localhost:3001

# ============================================================
# BACKEND — PRODUCTION
# ============================================================
PROD_DB_HOST=host.docker.internal
PROD_DB_PORT=3306
PROD_DB_USER=myuser
PROD_DB_PASSWORD=STRONG_PASSWORD_HERE
PROD_DB_NAME=mydb
PROD_JWT_SECRET=LONG_RANDOM_PRODUCTION_SECRET
PROD_JWT_EXPIRES_IN=24h
PROD_CORS_ORIGIN=https://myapp.example.com

# ============================================================
# FRONTEND — DEVELOPMENT
# ============================================================
DEV_REACT_APP_API_BASE_URL=http://localhost:3001/api
DEV_REACT_APP_ENABLE_API_LOGGING=true

# ============================================================
# FRONTEND — PRODUCTION
# ============================================================
PROD_REACT_APP_API_BASE_URL=https://myapp.example.com/api
PROD_REACT_APP_ENABLE_API_LOGGING=false

# ============================================================
# DEPLOYMENT INFRASTRUCTURE (only needed for remote-deploy.sh)
# ============================================================
REMOTE_HOST=1.2.3.4
REMOTE_USER=deploy
REMOTE_PASSWORD=SERVER_PASSWORD
REMOTE_PORT=22

REPO_URL=https://github.com/yourorg/yourrepo.git
GITHUB_TOKEN=github_pat_XXXXXXXXXXXXXXXXXXXX
```

### 2.2 How the App Reads the Flag

Inside the application (Node.js example):

```js
// config/database.js
const mode = process.env.DEPLOYMENT_MODE || 'development';
const prefix = mode === 'production' ? 'PROD_' : 'DEV_';

module.exports = {
  host:     process.env[`${prefix}DB_HOST`],
  port:     process.env[`${prefix}DB_PORT`],
  user:     process.env[`${prefix}DB_USER`],
  password: process.env[`${prefix}DB_PASSWORD`],
  database: process.env[`${prefix}DB_NAME`],
};
```

### 2.3 .env.example — What to Commit

Never commit `.env`. Commit `.env.example` with placeholder values:

```dotenv
DEPLOYMENT_MODE=development

PORT=3001
DEV_DB_HOST=host.docker.internal
DEV_DB_PORT=3306
DEV_DB_USER=
DEV_DB_PASSWORD=
DEV_DB_NAME=
DEV_JWT_SECRET=
...
```

### 2.4 .gitignore Rules

```gitignore
# Environment files — NEVER commit real secrets
.env
.env.local
.env.*.local

# Docker-specific ignore (optional separate file)
# list in .dockerignore instead for Docker builds
```

---

## 3. Dockerfile Patterns

### 3.1 Node.js Backend (Single Stage)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy manifests first — Docker caches this layer until package.json changes
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create any required runtime directories
RUN mkdir -p files/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', \
    (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
```

**Why `npm ci` instead of `npm install`?**  
`npm ci` uses `package-lock.json` for reproducible installs and fails if it is missing or out of sync — safer for CI/CD.

### 3.2 React / SPA Frontend (Multi-Stage)

Build arguments inject environment variables **at build time** because React embeds them into the JS bundle.

```dockerfile
# ── Stage 1: Build ────────────────────────────────────────
FROM node:18-alpine AS build

WORKDIR /app

# Declare build-time arguments
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_ENABLE_API_LOGGING

# Promote to ENV so Create React App picks them up
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_ENABLE_API_LOGGING=$REACT_APP_ENABLE_API_LOGGING

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve with nginx ──────────────────────────────
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 .dockerignore

Place at the root of each service that has a Dockerfile:

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
*.md
build
dist
```

Excluding `node_modules` and `.env` is critical — it keeps images small and prevents secrets from leaking into layers.

### 3.4 nginx.conf (SPA)

Minimal configuration that handles React Router and adds security headers:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Aggressive caching for hashed static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4. docker-compose.yml

### 4.1 Annotated Template

```yaml
# docker-compose.yml — run with: docker compose up -d
# .env in the same directory is loaded automatically

services:

  # ── Backend API ─────────────────────────────────────────
  backend:
    build:
      context: ./my-backend
      dockerfile: Dockerfile
    container_name: my-backend
    restart: unless-stopped
    environment:
      DEPLOYMENT_MODE: ${DEPLOYMENT_MODE:-development}
      NODE_ENV: ${DEPLOYMENT_MODE:-development}
      # Pass ALL prefixed vars — the app resolves them at runtime
      DEV_DB_HOST:     ${DEV_DB_HOST}
      DEV_DB_PORT:     ${DEV_DB_PORT}
      DEV_DB_USER:     ${DEV_DB_USER}
      DEV_DB_PASSWORD: ${DEV_DB_PASSWORD}
      DEV_DB_NAME:     ${DEV_DB_NAME}
      DEV_JWT_SECRET:  ${DEV_JWT_SECRET}
      PROD_DB_HOST:     ${PROD_DB_HOST}
      PROD_DB_PORT:     ${PROD_DB_PORT}
      PROD_DB_USER:     ${PROD_DB_USER}
      PROD_DB_PASSWORD: ${PROD_DB_PASSWORD}
      PROD_DB_NAME:     ${PROD_DB_NAME}
      PROD_JWT_SECRET:  ${PROD_JWT_SECRET}
      PORT: ${PORT}
    ports:
      - "3001:3001"
    volumes:
      - ./my-backend/files:/app/files    # persist uploaded files
    extra_hosts:
      - "host.docker.internal:host-gateway"  # reach host DB from container
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider",
             "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ── Frontend (built locally, served via nginx) ──────────
  frontend:
    build:
      context: ./my-frontend
      dockerfile: Dockerfile
      args:
        # Pick DEV or PROD URLs based on DEPLOYMENT_MODE
        REACT_APP_API_BASE_URL: >-
          ${DEPLOYMENT_MODE:-development == production
            ? PROD_REACT_APP_API_BASE_URL
            : DEV_REACT_APP_API_BASE_URL}
    container_name: my-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - app-network
    depends_on:
      - backend

networks:
  app-network:
    driver: bridge
```

> **Note on frontend build args:** Because React bakes env vars into the bundle at build time, you must pass the correct URL as a build arg. The deploy script handles this by explicitly `export`ing the right variable before building.

### 4.2 Key docker-compose Concepts

| Directive | Purpose |
|---|---|
| `restart: unless-stopped` | Auto-restart on crash or server reboot, unless manually stopped |
| `extra_hosts: host.docker.internal` | Lets the container reach a database on the host machine |
| `healthcheck` | Docker marks the container unhealthy if the app stops responding |
| `volumes` | Persist files across container recreations |
| `depends_on` | Start order only — does not wait for health; use `healthcheck` for that |
| `networks` | Isolate services; containers on the same network reach each other by service name |

---

## 5. Deploy Scripts

### 5.1 scripts/start.sh — Local Development

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Validate Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Start Docker Desktop first."
    exit 1
fi

# Resolve .env location
if [ -f "$PROJECT_ROOT/.env" ]; then
    ENV_FILE="$PROJECT_ROOT/.env"
else
    echo "❌ .env not found at $PROJECT_ROOT/.env"
    echo "   Copy .env.example to .env and fill in your values."
    exit 1
fi

cd "$PROJECT_ROOT"

echo "🚀 Starting containers..."
docker compose --env-file "$ENV_FILE" up -d --build

echo "✅ Done. Check status with: docker compose ps"
```

### 5.2 scripts/stop.sh — Graceful Shutdown

```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

docker compose down

echo "✅ Containers stopped."
echo "   To also remove volumes (⚠️ deletes DB data): docker compose down -v"
```

### 5.3 scripts/remote-deploy.sh — Push to Production Server

This script runs **locally** on the developer's machine. It:

1. Checks / establishes a VPN connection (if required)
2. Verifies the remote server is reachable
3. Uploads the local `.env` file to the server via `scp`
4. SSH-es into the server and runs one of several actions: full deploy, quick update, start, stop, restart, view logs, or status

```
Usage: bash scripts/remote-deploy.sh
(interactive menu)

Actions:
  1) Full Deploy   — git pull + npm build + docker compose up --build
  2) Quick Update  — git pull + docker compose restart  (no rebuild)
  3) Start         — docker compose up -d
  4) Stop          — docker compose down
  5) Restart       — docker compose restart
  6) Logs          — docker compose logs -f
  7) Status        — docker compose ps
```

**How environment variables flow during remote deploy:**

```
Local machine              Remote server
────────────────           ────────────────────────────────────────
.env (DEV values)
  │
  │  sed override:
  │  DEPLOYMENT_MODE=production
  │
  └──── scp ──────────────► /tmp/.env.netzero
                                  │
                                  │  cp to project root
                                  ▼
                             /www/my-deploy/.env (PROD values active)
                                  │
                                  ▼
                        docker compose --env-file .env up -d --build
```

The remote script (sent over SSH as a heredoc) runs entirely on the server — it has no access to local tool paths.

---

## 6. Remote Deployment Workflow

### 6.1 Prerequisites

| Tool | macOS install | Ubuntu install |
|---|---|---|
| `sshpass` | `brew install hudochenkov/sshpass/sshpass` | `apt install sshpass` |
| `openconnect` | `brew install openconnect` | `apt install openconnect` |
| `docker` (server) | — | `apt install docker.io` |
| `docker compose` (server) | — | `apt install docker-compose-plugin` |

### 6.2 First-Time Server Setup

```bash
# On the remote server
sudo mkdir -p /www/my-deploy
sudo chown -R $USER:$USER /www

# Clone the repo (the deploy script does this automatically, but manual steps:)
git clone https://<TOKEN>@github.com/yourorg/yourrepo.git /www/my-deploy

# Make sure docker daemon is running
sudo systemctl enable docker
sudo systemctl start docker
```

### 6.3 Full Deploy Flow (step by step)

```
1. Local:  bash scripts/remote-deploy.sh
           └─ Reads .env from project root
           └─ Sets DEPLOYMENT_MODE=production in a temp copy
           └─ Checks VPN / pings REMOTE_HOST
           └─ scp .env → server:/tmp/.env.project

2. SSH:    server executes:
           └─ git fetch --all && git reset --hard origin/main
           └─ mv /tmp/.env.project  /www/my-deploy/.env
           └─ sed: force DEPLOYMENT_MODE=production in .env
           └─ cd netzero-client && npm ci && npm run build
           └─ sudo mv build/ /var/www/html/myapp
           └─ docker compose --env-file .env up -d --build backend

3. Done:   docker compose ps  (show running containers)
```

### 6.4 Quick Update Flow

Same as above but skips `npm run build` and uses `docker compose restart` instead of `--build`. Use this when only backend code changed.

---

## 7. Security Checklist

- [ ] `.env` is in `.gitignore` and **never committed**
- [ ] `.env.example` is committed with empty/placeholder values
- [ ] Each Dockerfile has a matching `.dockerignore` that excludes `.env` and `node_modules`
- [ ] JWT secrets are long random strings (min 32 chars), not dictionary words
- [ ] Database passwords are strong and unique per environment
- [ ] `CORS_ORIGIN` lists only trusted origins — never `*` in production
- [ ] nginx has `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection` headers
- [ ] API keys (OpenAI, GitHub PAT, etc.) are rotated regularly
- [ ] `sshpass` usage is accepted as a trade-off for automation; prefer SSH key auth if possible
- [ ] VPN credentials are stored in `.env`, not hardcoded in scripts
- [ ] `REMOTE_PASSWORD` / `VPN_PASSWORD` in `.env` should be restricted to the developer machine
- [ ] `SUDO_PASSWORD` in `.env` should not exist in production; use passwordless sudo for the deploy user instead

---

## 8. Adapting to a Different Project Structure

### Scenario A: Single Service (no monorepo)

```
my-api/
├── .env
├── docker-compose.yml
├── Dockerfile
└── scripts/
    ├── start.sh
    └── remote-deploy.sh
```

- `docker-compose.yml` has a single service
- `Dockerfile` is at the root — `build.context: .`
- Remove all `DEV_CHAT_*` / `PROD_CHAT_*` vars from `.env`

### Scenario B: Different Frontend Framework (Vue, Angular, Next.js)

Replace the React multi-stage Dockerfile:

```dockerfile
# Next.js example
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build        # outputs .next/

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

- Next.js does NOT use nginx in the same way — the Next.js server itself serves pages
- Runtime env vars work differently: use `NEXT_PUBLIC_` prefix and pass them as Docker `environment:` (not build args)

### Scenario C: Python Backend (FastAPI / Django)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- Replace `DEV_DB_*` pattern with the same names; the Python app reads `os.environ`
- Replace healthcheck with a `curl` or `wget` to `/health`

### Scenario D: No VPN Required

In `remote-deploy.sh`, remove Steps 1 and 2 (VPN check). The script proceeds directly to Step 3 (sshpass check) and Step 4 (scp `.env`). Remove `VPN_*` variables from `.env`.

### Scenario E: GitHub Actions Instead of Shell Scripts

The shell scripts can be replaced or supplemented with a GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Write .env file
        run: echo "${{ secrets.DOTENV_PRODUCTION }}" > .env

      - name: Copy .env to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          password: ${{ secrets.REMOTE_PASSWORD }}
          source: .env
          target: /www/my-deploy/

      - name: Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          password: ${{ secrets.REMOTE_PASSWORD }}
          script: |
            cd /www/my-deploy
            git pull origin main
            sed -i 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' .env
            docker compose --env-file .env up -d --build
```

Store the entire production `.env` content as a single GitHub secret (`DOTENV_PRODUCTION`).

---

## 9. Troubleshooting

### Container exits immediately

```bash
docker compose logs <service-name>
```

Common causes:
- Missing env var — the app crashes on startup
- Port already in use on the host — change the host-side port in `ports:`
- Wrong `CMD` path — verify the entrypoint file exists

### `host.docker.internal` not resolving (Linux)

Add to the service in `docker-compose.yml`:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

This is automatic on Docker Desktop (macOS/Windows) but must be explicit on Linux.

### `.env` changes not picked up

Docker compose caches the built image. To force a rebuild with new env values:

```bash
docker compose up -d --build --force-recreate
```

For frontend images, build args are baked in at build time — a rebuild is always required when frontend URLs change.

### `scp` / `ssh` fails with "Host key verification failed"

Add `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null` to `scp`/`ssh` calls in the deploy script (already present in this project's `remote-deploy.sh`). For production systems, consider adding the server's host key to `known_hosts` instead.

### `npm ci` fails inside Docker

`npm ci` requires a `package-lock.json`. If it does not exist locally, run `npm install` once to generate it, then commit it.

### React build uses wrong API URL

The URL is baked in at build time via `ARG`. Check that the correct `PROD_REACT_APP_API_BASE_URL` value is set in `.env` before running the deploy script, and that the deploy script correctly `export`s it before `npm run build`.

---

*Last updated: May 2026*
