#!/usr/bin/env bash
# scripts/remote-deploy.sh
# Client-only deploy pipeline for knowledgehub-client.
# No Docker/server steps — only builds and publishes the React app.
#
# Pipeline:
#   1. Connect VPN
#   2. Upload .env to remote via scp
#   3. SSH heredoc:
#        a. git clone / pull
#        b. npm ci + npm run build
#        c. mv build/ → /www/wwwroot/engagement.chula.ac.th/knowledgehub

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# ── Load credentials ──────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: .env not found at $ENV_FILE" >&2
    exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

# ── Path constants (adapt per project) ───────────────────────
DEPLOY_PATH=/www/knowledgehub-deploy          # git workspace on remote
CLIENT_DIR=knowledgehub-client                # subfolder containing the React app
WEB_ROOT=/www/wwwroot/engagement.chula.ac.th/chula-glocal-market  # nginx document root

# ── Check dependencies ────────────────────────────────────────
for cmd in sshpass scp ssh; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: '$cmd' is not installed." >&2
        echo "  sshpass: brew install hudochenkov/sshpass/sshpass" >&2
        exit 1
    fi
done

# ── Menu ──────────────────────────────────────────────────────
echo ""
echo "=== knowledgehub Client Deploy ==="
echo "  1) Full deploy  (git pull + npm build + publish)"
echo "  2) Build only   (npm build + publish, no git pull)"
echo "  3) Git pull only"
echo ""
read -rp "Choose [1-3]: " ACTION

case "$ACTION" in
    1|2|3) ;;
    *) echo "Invalid choice." >&2; exit 1 ;;
esac

# ── Step 1 — VPN ─────────────────────────────────────────────
echo ""
echo "[1/3] VPN..."
"$SCRIPT_DIR/connect-vpn.sh"

# ── Step 2 — Upload .env ──────────────────────────────────────
echo ""
echo "[2/3] Uploading .env to remote /tmp/.env.knowledgehub ..."
sshpass -p "$REMOTE_PASSWORD" scp \
    -P "$REMOTE_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    "$ENV_FILE" \
    "$REMOTE_USER@$REMOTE_HOST:/tmp/.env.knowledgehub"

# ── Step 3 — Remote SSH heredoc ───────────────────────────────
echo ""
echo "[3/3] Running remote commands..."
echo ""

sshpass -p "$REMOTE_PASSWORD" ssh \
    -p "$REMOTE_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    "$REMOTE_USER@$REMOTE_HOST" \
    "REMOTE_SUDO_PASS='$REMOTE_PASSWORD' \
     GITHUB_TOKEN='$GITHUB_TOKEN' \
     REPO_URL='$REPO_URL' \
     ACTION='$ACTION' \
     DEPLOY_PATH='$DEPLOY_PATH' \
     CLIENT_DIR='$CLIENT_DIR' \
     WEB_ROOT='$WEB_ROOT' \
     bash -s" << 'ENDSSH'

set -euo pipefail

echo "--- Remote shell started (action=$ACTION) ---"

# ── Step a: Git clone / pull ──────────────────────────────────
if [[ "$ACTION" == "1" || "$ACTION" == "3" ]]; then
    echo "--- Git: clone or pull ---"
    if [[ -d "$DEPLOY_PATH/.git" ]]; then
        cd "$DEPLOY_PATH"
        echo "$REMOTE_SUDO_PASS" | sudo -S git fetch --all --prune
        echo "$REMOTE_SUDO_PASS" | sudo -S git reset --hard origin/main
    else
        # Remove any leftover non-git directory before cloning
        echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf "$DEPLOY_PATH"
        echo "$REMOTE_SUDO_PASS" | sudo -S git clone \
            "https://${GITHUB_TOKEN}@${REPO_URL#https://}" \
            "$DEPLOY_PATH"
    fi
fi

# ── Place .env into deploy path (after git so rm -rf won't delete it) ──
echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p "$DEPLOY_PATH"
echo "$REMOTE_SUDO_PASS" | sudo -S mv /tmp/.env.knowledgehub "$DEPLOY_PATH/.env"
echo "$REMOTE_SUDO_PASS" | sudo -S chmod 600 "$DEPLOY_PATH/.env"

if [[ "$ACTION" == "3" ]]; then
    echo "--- Git pull complete. Exiting. ---"
    exit 0
fi

# ── Fix ownership so npm can write without sudo ───────────────
echo "$REMOTE_SUDO_PASS" | sudo -S chown -R "$(whoami):" "$DEPLOY_PATH"

# ── Step b: React build ───────────────────────────────────────
echo "--- npm install + build ---"
cd "$DEPLOY_PATH/$CLIENT_DIR"

# Load PROD_* vars and re-export without prefix
if [[ -f "$DEPLOY_PATH/.env" ]]; then
    # shellcheck disable=SC1091
    source "$DEPLOY_PATH/.env"
fi

export REACT_APP_API_BASE_URL="${PROD_REACT_APP_API_BASE_URL:-}"

npm install --legacy-peer-deps
npm run build

# ── Step c: Publish build ─────────────────────────────────────
echo "--- Publishing build to $WEB_ROOT ---"
echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p "$(dirname "$WEB_ROOT")"
echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf "$WEB_ROOT"
echo "$REMOTE_SUDO_PASS" | sudo -S mv \
    "$DEPLOY_PATH/$CLIENT_DIR/build" \
    "$WEB_ROOT"

echo ""
echo "=== Deploy complete ==="
echo "    Published to: $WEB_ROOT"
echo ""

ENDSSH

echo ""
echo "Done."
