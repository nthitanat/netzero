# Docker & Deploy Script Workflow Guide

A reference guide for deploying Dockerized applications to a remote server using shell-based automation. Covers the patterns, SSH optimization, and GitHub authentication strategies used in our deploy scripts — applicable to both multi-service monorepos and single-container projects.

For the higher-level architecture analysis of the Compose files, environment file strategy, and reusable project template, see [GENERAL_DEPLOYMENT_ARCHITECTURE.md](GENERAL_DEPLOYMENT_ARCHITECTURE.md).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Docker Setup](#docker-setup)
  - [Multi-Stage Dockerfiles](#multi-stage-dockerfiles)
  - [Docker Compose File Layering](#docker-compose-file-layering)
  - [Single-Container Projects](#single-container-projects)
  - [Development vs Production](#development-vs-production)
- [Deploy Script Workflow](#deploy-script-workflow)
  - [Configuration (`config.sh`)](#configuration-configsh)
  - [Commands Reference](#commands-reference)
  - [Single SSH Session (Connection Multiplexing)](#single-ssh-session-connection-multiplexing)
  - [GitHub Token Workflow](#github-token-workflow)
  - [VPN Connection](#vpn-connection)
  - [Environment File Upload](#environment-file-upload)
- [Deployment Flows](#deployment-flows)
  - [First-Time Init Flow](#first-time-init-flow)
  - [Update Flow](#update-flow)
- [Adapting for a New Project](#adapting-for-a-new-project)
- [Security Considerations](#security-considerations)

---

## Overview

This deployment system runs entirely from a developer's local machine (typically macOS). It uses a single shell script (`deploy.sh`) to:

1. Optionally connect to a VPN
2. Open a **single persistent SSH session** to the remote server
3. Clone or pull the project from a **private GitHub repo** (authenticated via a Personal Access Token)
4. Upload `.env.production` file(s) via SCP
5. Build and run Docker containers on the server

It works for:
- **Multi-service monorepos** — multiple services each with their own Dockerfile, orchestrated via Docker Compose
- **Single-container projects** — one service, one Dockerfile, optionally with Docker Compose or plain `docker run`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Developer Machine (macOS)                   │
│                                                                 │
│  deploy/                                                        │
│  ├── config.sh          ← credentials & settings (.gitignored)  │
│  ├── deploy.sh          ← main deployment orchestrator          │
│  └── vpn-connect.sh     ← optional VPN tunnel                  │
│                                                                 │
│  <service>/.env.production  ← uploaded to server via SCP        │
│                                                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               │  SSH (single multiplexed connection)
               │  + SCP (file uploads reuse same connection)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Remote Server (Linux)                        │
│                                                                 │
│  /path/to/project/               ← git clone of repository      │
│  ├── docker-compose.yml          ← base config                  │
│  ├── docker-compose.prod.yml     ← production overrides         │
│  ├── <service>/                                                 │
│  │   ├── Dockerfile                                             │
│  │   └── .env.production         ← SCP-uploaded secrets         │
│  └── ...                                                        │
│                                                                 │
│  ┌───────────── Docker Network ──────────────────────────────┐  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐       ┌────────────┐     │  │
│  │  │ Service A  │  │ Service B  │  ...  │ Service N  │     │  │
│  │  └────────────┘  └────────────┘       └────────────┘     │  │
│  │         (may be a single container for simple projects)   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Database (external — on host machine or a separate server)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Docker Setup

### Multi-Stage Dockerfiles

Each service uses a **multi-stage build** with a shared `base` stage and separate `development`/`production` targets. The target is selected by the docker-compose override file.

```dockerfile
# ── Base stage ── shared dependencies
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./

# ── Development stage ──
FROM base AS development
ENV NODE_ENV=development
RUN npm install              # all deps including devDependencies
COPY . .
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]    # hot-reload (nodemon / vite / etc.)

# ── Production stage ──
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
COPY src ./src

# Non-root user for security
RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app
USER nodejs

ENTRYPOINT ["dumb-init", "--"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:PORT/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["npm", "start"]
```

Key patterns:

| Pattern                 | Why                                                             |
| ----------------------- | --------------------------------------------------------------- |
| `dumb-init`             | Handles PID 1 signal forwarding so containers stop gracefully   |
| Non-root `nodejs` user  | Production runs with least privilege (UID 1001)                 |
| `HEALTHCHECK`           | Docker auto-restarts unhealthy containers                       |
| `npm ci --only=production` | Deterministic installs, no devDependencies                  |

#### Bind-mount volume ownership fix

If a production container uses bind-mounted volumes (e.g., `uploads/`), Docker overrides the Dockerfile's `chown`. Use an **entrypoint script** that runs as root to fix ownership, then drops privileges:

```sh
#!/bin/sh
set -e
mkdir -p /app/uploads
chown -R nodejs:nodejs /app/uploads
exec su-exec nodejs "$@"          # requires: apk add su-exec
```

In the Dockerfile, omit the `USER nodejs` directive and use:

```dockerfile
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/entrypoint.sh"]
```

This pattern is only needed when bind-mounts conflict with the non-root user. For containers without bind-mounts, a simple `USER nodejs` directive is sufficient.

### Docker Compose File Layering

Docker Compose supports **file overrides** via the `-f` flag. This separates base definitions from environment-specific settings:

```
docker-compose.yml              ← Base: service definitions, ports, network
  + docker-compose.dev.yml      ← Dev: volumes, hot-reload, dev tools
  + docker-compose.prod.yml     ← Prod: env_file, resource limits, logging
```

**Base** (`docker-compose.yml`):

```yaml
services:
  app:                           # or multiple services
    build:
      context: ./my-service
      dockerfile: Dockerfile
    container_name: my-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - app-network
    extra_hosts:
      - "host.docker.internal:host-gateway"   # access host DB

networks:
  app-network:
    driver: bridge
```

**Development override** (`docker-compose.dev.yml`):

```yaml
services:
  app:
    build:
      target: development
    env_file:
      - ./my-service/.env.development
    volumes:
      - ./my-service/src:/app/src       # hot-reload
      - /app/node_modules               # prevent overwrite
    command: npm run dev
    environment:
      - DB_HOST=host.docker.internal
```

**Production override** (`docker-compose.prod.yml`):

```yaml
services:
  app:
    build:
      target: production
      args:
        NODE_ENV: production
    env_file:
      - ./my-service/.env.production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Usage:**

```bash
# Development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production (what the deploy script runs)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Single-Container Projects

For projects with only one service, the same patterns apply at a smaller scale.

**Option A — Docker Compose (recommended for consistency):**

Use the same layered compose files above, just with a single service. The deploy script works without modification.

**Option B — Plain `docker run` (minimal projects):**

Skip Compose entirely and replace the `docker compose` calls in `deploy.sh`:

```bash
# In remote_exec calls:
docker build -t my-app --target production .
docker stop my-app 2>/dev/null || true
docker rm my-app 2>/dev/null || true
docker run -d --name my-app --restart unless-stopped \
  -p 3000:3000 --env-file .env.production my-app
```

### Development vs Production

| Feature              | Development                            | Production                              |
| -------------------- | -------------------------------------- | --------------------------------------- |
| Dockerfile target    | `development`                          | `production`                            |
| Dependencies         | All (including devDependencies)         | Production only (`npm ci`)              |
| Source code          | Bind-mounted from host                 | Baked into image at build time          |
| Hot reload           | Yes (nodemon, vite, etc.)              | No                                      |
| User                 | root (for simplicity)                  | Non-root (`nodejs`, UID 1001)           |
| Health check         | Optional                               | Enabled                                 |
| Resource limits      | None                                   | CPU + memory caps                       |
| Logging              | Default (stdout)                       | JSON file with rotation                 |
| Dev tools            | Local DBs, admin UIs, debug ports, stubs | None                                  |

---

## Deploy Script Workflow

### Configuration (`config.sh`)

All deployment settings live in `deploy/config.sh`. **This file must be `.gitignored` — it contains credentials.**

```bash
# ── Server ──
SERVER_HOST="<ip-or-hostname>"
SERVER_USER="<ssh-user>"
SERVER_PASSWORD="<ssh-password>"
SERVER_PORT="22"
SERVER_DEPLOY_PATH="/path/to/project"

# ── VPN (optional) ──
VPN_SKIP=true                    # set to false if VPN is required
VPN_HOST="vpn.example.com"
VPN_USERNAME="<vpn-user>"
VPN_PASSWORD="<vpn-pass>"
VPN_PROTOCOL="openconnect"       # or "openvpn"
SUDO_PASSWORD="<macos-password>" # for running VPN with sudo

# ── GitHub ──
GITHUB_TOKEN="github_pat_..."    # Personal Access Token
GITHUB_REPO="https://github.com/<owner>/<repo>"
GITHUB_BRANCH="main"

# ── Docker ──
# Multi-service:
DOCKER_COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
# Single-service (no prod override file):
# DOCKER_COMPOSE_FILES="-f docker-compose.yml"

# ── Application ──
SERVER_APP_PORT="3000"
NODE_ENV="production"
```

### Commands Reference

```bash
bash deploy.sh [--skip-vpn] <command>
```

| Command     | Description                                          |
| ----------- | ---------------------------------------------------- |
| `init`      | First-time setup: clone repo, build images, start    |
| `update`    | Pull latest code, rebuild images, recreate containers|
| `restart`   | Restart existing containers                          |
| `start`     | Start stopped containers                             |
| `stop`      | Stop running containers                              |
| `logs`      | Stream container logs (Ctrl+C to exit)               |
| `status`    | Show container status and health                     |

Flag `--skip-vpn` skips the VPN connection step.

### Single SSH Session (Connection Multiplexing)

**This is the key optimization in the deploy script.** Instead of opening a new SSH connection for every remote command (full TCP handshake + SSH authentication each time), the script uses **OpenSSH connection multiplexing** to establish a single persistent SSH session and reuse it for all subsequent commands and file transfers.

#### How it works

```
                    Time ──────────────────────────────────────────────►

Without multiplexing (slow):
  [SSH handshake] ─ cmd1 ─ [close]
                            [SSH handshake] ─ cmd2 ─ [close]
                                                      [SSH handshake] ─ cmd3 ─ [close]

With multiplexing (fast):
  [SSH handshake] ══════════════════════════════════════════════ [close]
         │              │              │              │
        cmd1           cmd2          SCP            cmd3
         │              │           upload           │
         ▼              ▼              ▼              ▼
```

#### Step-by-step

**1. Create a control socket directory:**

```bash
SSH_CONTROL_DIR="/tmp/myproject-deploy-ssh"
SSH_CONTROL_PATH="$SSH_CONTROL_DIR/control-%r@%h:%p"
mkdir -p "$SSH_CONTROL_DIR"
```

The control socket path uses OpenSSH tokens — `%r` (remote user), `%h` (host), `%p` (port) — to produce a unique socket file per connection target.

**2. Establish the master connection:**

```bash
sshpass -p "$SERVER_PASSWORD" ssh \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o ControlMaster=auto \
    -o ControlPath="$SSH_CONTROL_PATH" \
    -o ControlPersist=600 \
    -p "$SERVER_PORT" \
    -N -f \
    "$SERVER_USER@$SERVER_HOST"
```

| Flag                       | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `-o ControlMaster=auto`    | Become the master if none exists, otherwise reuse an existing one                      |
| `-o ControlPath=...`       | Path to the Unix domain socket for communication between master and slave sessions     |
| `-o ControlPersist=600`    | Keep master alive for 600s (10 min) after the last slave disconnects                   |
| `-N`                       | Don't execute a remote command — this is only the control channel                      |
| `-f`                       | Fork to background after connecting                                                    |

**3. Reuse in all subsequent SSH and SCP calls:**

Every `remote_exec()` and `upload_file()` includes the same `ControlMaster`/`ControlPath`/`ControlPersist` options. OpenSSH detects the existing master socket and multiplexes the new session over it — **no new TCP connection or authentication is needed**.

```bash
# Execute a command on the remote server
remote_exec() {
    local cmd="$1"
    sshpass -p "$SERVER_PASSWORD" ssh \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ControlMaster=auto \
        -o ControlPath="$SSH_CONTROL_PATH" \
        -o ControlPersist=600 \
        -p "$SERVER_PORT" \
        "$SERVER_USER@$SERVER_HOST" \
        "$cmd"
}

# Upload a file via SCP (also reuses the same master connection)
upload_file() {
    local local_file="$1"
    local remote_file="$2"
    sshpass -p "$SERVER_PASSWORD" scp \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ControlMaster=auto \
        -o ControlPath="$SSH_CONTROL_PATH" \
        -o ControlPersist=600 \
        -P "$SERVER_PORT" \
        "$local_file" \
        "$SERVER_USER@$SERVER_HOST:$remote_file"
}
```

**4. Clean up on exit:**

A `trap` ensures the master connection is closed when the script ends — whether normally, via Ctrl+C, or on error:

```bash
trap 'cleanup_ssh_multiplexing 2>/dev/null || true' EXIT INT TERM

cleanup_ssh_multiplexing() {
    ssh -o ControlPath="$SSH_CONTROL_PATH" -O exit "$SERVER_USER@$SERVER_HOST" 2>/dev/null || true
    rm -rf "$SSH_CONTROL_DIR"
}
```

`-O exit` sends a control command to the master process to gracefully shut down.

#### Why this matters

A typical `update` deployment runs many SSH operations sequentially:

| # | Operation                   | Without Multiplexing | With Multiplexing |
|---|-----------------------------|---------------------|-------------------|
| 1 | `git pull`                  | ~2s handshake       | instant           |
| 2 | SCP `.env.production`       | ~2s handshake       | instant           |
| 3 | `docker compose build`      | ~2s handshake       | instant           |
| 4 | `docker compose up -d`      | ~2s handshake       | instant           |
| 5 | `docker compose ps`         | ~2s handshake       | instant           |
|   | **Total SSH overhead**      | **~10s+**           | **~2s** (once)    |

On high-latency or VPN-tunneled connections, the savings are even larger. More services = more SCP uploads = bigger impact.

#### Exception: `logs` command

The `logs` command streams output indefinitely (`docker compose logs -f`). It opens a **standalone SSH session** that the user terminates with Ctrl+C, rather than using the multiplexed master.

### GitHub Token Workflow

The remote server needs to pull code from a **private GitHub repository**. Since SSH keys are typically not configured on deployment servers, authentication is handled via a **GitHub Personal Access Token (PAT)** embedded in the HTTPS clone URL.

#### How it works

```
config.sh:
  GITHUB_TOKEN="github_pat_xxxx..."
  GITHUB_REPO="https://github.com/<owner>/<repo>"

                                ▼

deploy.sh constructs an authenticated URL at runtime:
  https://github_pat_xxxx...@github.com/<owner>/<repo>
       ▲
       └── Token is embedded as the "username" portion of the URL
```

Git treats the portion before `@` in an HTTPS URL as credentials. GitHub accepts the PAT as both username and password.

#### URL construction

The script uses `sed` to inject the token:

```bash
CLONE_URL=$(echo "$GITHUB_REPO" | sed "s|https://|https://$GITHUB_TOKEN@|")
# Input:  https://github.com/owner/repo
# Output: https://github_pat_xxxx...@github.com/owner/repo
```

#### Used in two deployment commands

**`init` — first-time clone:**

```bash
# Clone the repo using the token-authenticated URL
remote_exec "git clone $CLONE_URL $SERVER_DEPLOY_PATH"

# Persist the token URL as the origin remote for future pulls
remote_exec "cd $SERVER_DEPLOY_PATH && git remote set-url origin $CLONE_URL"
```

**`update` — pull latest code:**

```bash
# Re-set the remote URL before pulling (picks up rotated tokens)
PULL_URL=$(echo "$GITHUB_REPO" | sed "s|https://|https://$GITHUB_TOKEN@|")
remote_exec "cd $SERVER_DEPLOY_PATH && git remote set-url origin $PULL_URL && git pull origin $GITHUB_BRANCH"
```

The remote URL is **re-set on every update**. If you rotate the PAT in `config.sh`, the next deployment uses the new token automatically — no manual server intervention needed.

#### Token lifecycle

```
Developer creates a PAT on GitHub
  (Settings → Developer settings → Personal access tokens)
       │
       ▼
Token stored in deploy/config.sh (local machine only, .gitignored)
       │
       ▼
deploy.sh injects token into HTTPS URL at runtime
       │
       ▼
Token sent to remote server via SSH (encrypted in transit)
       │
       ▼
Token persists in <project>/.git/config on the server (as origin URL)
       │
       ▼
Future pulls use the stored token
  (re-set on every `update` to pick up rotated tokens)
```

#### Creating a GitHub PAT

1. Go to **GitHub → Settings → Developer settings → Personal access tokens**
2. Choose **Fine-grained tokens** (recommended) or **Classic tokens**
3. For fine-grained tokens:
   - **Repository access**: Only select repositories → choose your repo
   - **Permissions**: Contents → Read-only (minimum needed for `git pull`)
   - **Expiration**: Set a reasonable expiry (e.g., 90 days)
4. For classic tokens: the minimum scope is `repo`
5. Copy the token into `GITHUB_TOKEN` in `config.sh`

#### Token rotation

When a token expires or is compromised:

1. Revoke the old token on GitHub
2. Generate a new one
3. Update `GITHUB_TOKEN` in `config.sh`
4. Run `bash deploy.sh update` — the script re-sets the origin URL automatically

### VPN Connection

Some servers sit behind a VPN. The script supports automatic VPN connection via `vpn-connect.sh`:

```
deploy.sh
  │
  ├─ VPN_SKIP=true in config.sh?  ──Yes──► Skip VPN
  │
  └─ --skip-vpn flag passed?       ──Yes──► Skip VPN
     │
     └─ No → vpn-connect.sh
              ├─ OpenConnect (Cisco AnyConnect compatible)
              └─ OpenVPN (requires .ovpn config file)
```

Set `VPN_SKIP=true` in `config.sh` if VPN is not needed. Use `--skip-vpn` flag for one-off overrides.

### Environment File Upload

Sensitive environment variables (DB credentials, API keys, provider credentials, integration settings) are **never committed to git**. Instead:

1. `.env.production` file(s) live on the developer's local machine (`.gitignored`).

2. On every `init` or `update`, the script **uploads them via SCP** (reusing the multiplexed SSH session):

   ```bash
   # Single-service project
   upload_file "$PROJECT_ROOT/.env.production" "$SERVER_DEPLOY_PATH/.env.production"

   # Multi-service monorepo
   upload_file "$PROJECT_ROOT/service-a/.env.production" "$SERVER_DEPLOY_PATH/service-a/.env.production"
   upload_file "$PROJECT_ROOT/service-b/.env.production" "$SERVER_DEPLOY_PATH/service-b/.env.production"
   ```

3. Docker Compose injects them via `env_file:`:

   ```yaml
   services:
     app:
       env_file:
         - ./.env.production
   ```

This ensures secrets are: (a) not in git, (b) encrypted in transit via SSH, (c) refreshed on every deployment.

---

## Deployment Flows

### First-Time Init Flow

```bash
bash deploy.sh init
```

```
 1.  Check dependencies (sshpass installed?)
 2.  Connect VPN (if enabled)
 3.  ── setup_ssh_multiplexing() ──
 │   Establish single persistent SSH connection
 │
 4.  Check/install Docker on remote server
 5.  Check/install Docker Compose on remote server
 6.  Check if deploy path already exists
 │   ├─ Exists → prompt to re-clone or keep
 │   └─ Not exists → continue
 7.  mkdir -p <deploy-path>
 8.  git clone (with GitHub token URL)
 9.  git remote set-url origin (persist token URL)
10.  SCP upload .env.production file(s)
11.  docker compose build
12.  docker compose up -d
13.  docker compose ps (show status)
 │
 └── cleanup_ssh_multiplexing() ──
     Close master SSH connection
```

### Update Flow

```bash
bash deploy.sh update
```

```
 1.  Check dependencies
 2.  Connect VPN (if enabled)
 3.  ── setup_ssh_multiplexing() ──
 │
 4.  git remote set-url origin (refresh token in URL)
 5.  git pull origin <branch>
 6.  SCP upload .env.production file(s)
 7.  docker compose build
 8.  docker compose up -d --force-recreate
 9.  docker compose ps (show status)
 │
 └── cleanup_ssh_multiplexing() ──
```

`--force-recreate` ensures containers are recreated even if the image hasn't changed (needed when only `.env.production` was updated).

---

## Adapting for a New Project

### Quick checklist

1. **Copy the `deploy/` directory** into your new project root.

2. **Create `deploy/config.sh`** from the template in [Configuration](#configuration-configsh). Fill in:
   - Server connection details (`SERVER_HOST`, `SERVER_USER`, `SERVER_PASSWORD`, `SERVER_PORT`)
   - Deploy path on the server (`SERVER_DEPLOY_PATH`)
   - GitHub credentials (`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`)
   - Docker Compose files (`DOCKER_COMPOSE_FILES`)

3. **Add `deploy/config.sh` to `.gitignore`**. It contains secrets.

4. **Adjust `upload_env_files()` in `deploy.sh`**:
   - Single-service: upload one `.env.production`
   - Multi-service: upload one per service subdirectory

5. **Create your Dockerfile(s)** with `development` and `production` targets (see [Multi-Stage Dockerfiles](#multi-stage-dockerfiles)).

6. **Create your Docker Compose files** (at minimum `docker-compose.yml`; add `docker-compose.prod.yml` for production overrides).

7. **Create `.env.production`** locally with your production environment variables.

8. **Run `bash deploy.sh init`** for first-time deployment.

### Single-container example

For a project with one service and no compose override:

```bash
# config.sh
DOCKER_COMPOSE_FILES="-f docker-compose.yml"
```

```bash
# deploy.sh — simplified upload_env_files()
upload_env_files() {
    upload_file "$PROJECT_ROOT/.env.production" "$SERVER_DEPLOY_PATH/.env.production"
}
```

Everything else (SSH multiplexing, GitHub token, VPN, all deploy commands) works identically — no changes needed.

---

## Security Considerations

| Concern                     | Current Pattern                          | Recommended Improvement                     |
| --------------------------- | ---------------------------------------- | ------------------------------------------- |
| Plaintext passwords         | `config.sh` has credentials in plaintext | Secrets manager, `gpg`-encrypted file, or `1password-cli` |
| SSH authentication          | Password-based via `sshpass`             | SSH key authentication (no password needed) |
| GitHub PAT scope            | May be over-privileged                   | Fine-grained PAT with minimal scope (Contents: read-only) |
| PAT in `.git/config`        | Persists on server after clone/pull      | Use `git credential-cache` with a TTL       |
| `StrictHostKeyChecking=no`  | Disables host key verification           | Add server's key to `~/.ssh/known_hosts`    |
| Root escalation             | Password piped via `echo` to `sudo -S`   | Passwordless sudo for the deploy user       |
| `.env.production` on server | Readable by anyone with server access    | `chmod 600` and restrict to deploy user     |
| Token expiry                | May use non-expiring tokens              | Set 90-day expiration and rotate regularly  |
