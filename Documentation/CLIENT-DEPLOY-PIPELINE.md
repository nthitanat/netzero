# Client-Side Deploy Pipeline

> **Security note:** This document contains live credentials. Keep it out of version control (add to `.gitignore`) or store credentials in a separate secrets file.

---

## Overview

The client (React) is **not** served from Docker. It is built on the remote server and the `build/` output is placed directly under the web server's document root. Docker is only used for the backend (`netzero-server`, `netzero-chat-server`).

```
Local machine 
  └─ scripts/remote-deploy.sh
       1. Connect VPN (openconnect → vpn.chula.ac.th)
       2. Upload .env via scp
       3. Open single SSH session (heredoc)
            a. git clone / pull
            b. npm ci + npm run build   ← client build
            c. mv build/ → /www/wwwroot/…/netzero
            d. docker-compose up (servers only)
```

---

## Credentials Reference (from `.env`)

### VPN

| Variable | Value | Purpose |
|---|---|---|
| `VPN_HOST` | `vpn.chula.ac.th` | Chula VPN gateway |
| `VPN_USERNAME` | `njaitip` | VPN login username |
| `VPN_PASSWORD` | `Charlie04!` | VPN login password |
| `SUDO_PASSWORD` | `oontoon24` | Local macOS sudo (needed by openconnect) |

### Remote Server SSH

| Variable | Value | Purpose |
|---|---|---|
| `REMOTE_HOST` | `161.200.199.67` | Remote server IP (only reachable via VPN) |
| `REMOTE_USER` | `adminroot` | SSH login user |
| `REMOTE_PASSWORD` | `tZ#A,2]@KdGJ` | SSH / sudo password on remote |
| `REMOTE_PORT` | `22` | SSH port |

### GitHub

| Variable | Value | Purpose |
|---|---|---|
| `REPO_URL` | `https://github.com/nthitanat/netzero.git` | Repository to clone/pull |
| `GITHUB_TOKEN` | `github_pat_11AOMLYQQ0…` | PAT embedded in clone URL to bypass auth |

### React Production Build Variables

These are read from `.env` on the remote server during `npm run build`. The `PROD_` prefix is the convention used so the same `.env` file can hold both dev and prod values.

| Variable | Value |
|---|---|
| `PROD_REACT_APP_API_BASE_URL` | `https://engagement.chula.ac.th/netzero-api/` |
| `PROD_REACT_APP_CHAT_API_BASE_URL` | `https://engagement.chula.ac.th/netzero-api-chat/api/v1` |
| `PROD_REACT_APP_USE_REAL_TREE_API` | `true` |
| `PROD_REACT_APP_TREE_IMAGES_BASE_URL` | `https://your-cdn.com/tree-images` |
| `PROD_REACT_APP_ENABLE_API_LOGGING` | `false` |

The deploy script exports them without the prefix before calling `npm run build`:

```bash
export REACT_APP_API_BASE_URL="$PROD_REACT_APP_API_BASE_URL"
export REACT_APP_CHAT_API_BASE_URL="$PROD_REACT_APP_CHAT_API_BASE_URL"
# …etc
npm run build
```

---

## Step-by-Step Pipeline

### Step 1 — VPN (`scripts/connect-vpn.sh`)

`openconnect` is used instead of Cisco AnyConnect because it can be fully scripted.

```bash
# Password piped from CRED_FILE (temp file created from $VPN_PASSWORD)
sudo openconnect \
    --background \
    --pid-file=/var/run/openconnect.pid \
    --passwd-on-stdin \
    --user="$VPN_USERNAME" \
    "$VPN_HOST" < "$CRED_FILE"
```

- `SUDO_PASSWORD` is passed via `echo "$SUDO_PASSWORD" | sudo -S -v` to pre-validate the sudo token before the actual command runs.
- The script checks `pgrep -x openconnect`; if already running it skips reconnection.

### Step 2 — Upload `.env` via SCP

Because `.env` is in `.gitignore` it is never in the repository. It must be pushed manually before each deploy:

```bash
sshpass -p "$REMOTE_PASSWORD" scp \
    -P "$REMOTE_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    "$PROJECT_ROOT/.env" \
    "$REMOTE_USER@$REMOTE_HOST:/tmp/.env.netzero"
```

It lands in `/tmp/.env.netzero` and is moved to `$DEPLOY_PATH/.env` inside the SSH session.

### Step 3 — Single SSH Session (heredoc)

All remote work happens in **one** SSH connection. A heredoc (`<< 'ENDSSH'`) is passed as stdin so the remote shell receives the entire script at once — no interactive prompts, no second connection.

```bash
sshpass -p "$REMOTE_PASSWORD" ssh \
    -p "$REMOTE_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    "$REMOTE_USER@$REMOTE_HOST" \
    "REMOTE_SUDO_PASS='$REMOTE_PASSWORD' GITHUB_TOKEN='$GITHUB_TOKEN' REPO_URL='$REPO_URL' ACTION='$ACTION' bash -s" << 'ENDSSH'
# … all remote commands here …
ENDSSH
```

Key points:
- `'ENDSSH'` (single-quoted) prevents local shell from expanding `$variables` inside the heredoc — they are evaluated on the **remote** shell.
- Secret variables (`REMOTE_SUDO_PASS`, `GITHUB_TOKEN`, etc.) are injected as inline environment variables on the `ssh` command line, not inside the heredoc, so local expansion happens correctly for those values.
- `bash -s` makes the remote shell read its script from stdin (the heredoc).

### Step 4 — Password Auto-Input for Remote `sudo`

The remote server requires `sudo` for directory operations and Docker. Because there is no TTY in a non-interactive SSH session, `sudo -S` (read password from stdin) is used with `echo`:

```bash
echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www
echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose up -d ...
```

`$REMOTE_SUDO_PASS` was injected by the local script and equals `REMOTE_PASSWORD`.

### Step 5 — Git Clone / Pull

```bash
DEPLOY_PATH=/www/netzero-deploy

if [ ! -d "$DEPLOY_PATH/.git" ]; then
    git clone "https://${GITHUB_TOKEN}@${REPO_URL#https://}" "$DEPLOY_PATH"
else
    cd "$DEPLOY_PATH"
    git fetch --all --prune
    git reset --hard origin/main
fi
```

`${REPO_URL#https://}` strips the `https://` prefix so the token can be prepended: `https://<TOKEN>@github.com/…`

### Step 6 — React Build

```bash
cd "$DEPLOY_PATH/netzero-client"
npm ci          # reproducible install (requires package-lock.json)
# env vars exported from .env (PROD_* → REACT_APP_*)
npm run build   # outputs to netzero-client/build/
```

### Step 7 — Folder Move and Rename

This is the key client deployment step. The `build/` directory is moved and renamed in one `mv` command:

```
Source:      /www/netzero-deploy/netzero-client/build/
Destination: /www/wwwroot/engagement.chula.ac.th/netzero/
```

```bash
echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf /www/wwwroot/engagement.chula.ac.th/netzero
echo "$REMOTE_SUDO_PASS" | sudo -S mv \
    "$DEPLOY_PATH/netzero-client/build" \
    /www/wwwroot/engagement.chula.ac.th/netzero
```

- The old `netzero/` folder is deleted first so `mv` does not nest the new one inside it.
- The folder is renamed from `build` → `netzero` as part of the move.
- Nginx (on the host, not in Docker) serves files from `/www/wwwroot/engagement.chula.ac.th/` and maps `/netzero` to this directory.

---

## Reusing This Pipeline for Another Project

To adapt this pipeline for a different project on the same host (`161.200.199.67`):

### 1. Copy and update `.env` keys

```
# Remote is the same
REMOTE_HOST=161.200.199.67
REMOTE_USER=adminroot
REMOTE_PASSWORD="tZ#A,2]@KdGJ"
REMOTE_PORT=22

# Change these per project
REPO_URL=https://github.com/your-org/your-repo.git
GITHUB_TOKEN=<new PAT>

PROD_REACT_APP_API_BASE_URL=https://engagement.chula.ac.th/your-api/
# …other REACT_APP vars
```

### 2. Update the three path constants in `remote-deploy.sh`

| Variable / literal | Current value | Change to |
|---|---|---|
| `DEPLOY_PATH` | `/www/netzero-deploy` | `/www/<project>-deploy` |
| Web root rm target | `/www/wwwroot/engagement.chula.ac.th/netzero` | `/www/wwwroot/…/<subfolder>` |
| Web root mv target | `/www/wwwroot/engagement.chula.ac.th/netzero` | same subfolder |

### 3. Keep the SSH / sshpass / sudo pattern unchanged

The mechanism (sshpass + heredoc + `echo $PASS | sudo -S`) works for any command on this host — no changes needed.

### 4. VPN

The VPN credentials (`VPN_USERNAME`, `VPN_PASSWORD`) are personal. Each developer uses their own Chula account. `SUDO_PASSWORD` is the local macOS password and changes per machine.

---

## Quick-Reference: Running the Script

```bash
cd /path/to/project
./scripts/remote-deploy.sh
```

| Choice | Action |
|---|---|
| 1 | Full deploy: git pull + npm build + mv + docker-compose up (servers) |
| 2 | Quick update: git pull + docker-compose restart (no client rebuild) |
| 3 | Start containers |
| 4 | Stop containers |
| 5 | Restart containers |
| 6 | Tail logs |
| 7 | Show container status |

> Option 1 is the only one that rebuilds and redeploys the React client.
