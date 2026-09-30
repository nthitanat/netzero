#!/usr/bin/env bash
# RETIRED: preserved for history only; use NetZero scripts/remote-deploy.sh.
printf "%s\n" "Retired Glocal deployment script. Use NetZero scripts/remote-deploy.sh." >&2
exit 1

# deploy/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
# Deploy script for KnowledgeHub (static React build served from nginx).
#
# Usage:
#   bash deploy.sh [--skip-vpn] <command>
#
# Commands:
#   init      First-time setup: clone repo, build, and deploy static files
#   update    Pull latest code, rebuild, and redeploy static files
#   status    Show current deployment info
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.sh"

# ── Load config ───────────────────────────────────────────────────────────────
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "ERROR: config.sh not found at $CONFIG_FILE"
    echo "       Copy deploy/config.sh.example and fill in your values."
    exit 1
fi
# shellcheck source=config.sh
source "$CONFIG_FILE"

# ── Parse arguments ───────────────────────────────────────────────────────────
SKIP_VPN=false
COMMAND=""

for arg in "$@"; do
    case "$arg" in
        --skip-vpn) SKIP_VPN=true ;;
        *)          COMMAND="$arg" ;;
    esac
done

if [[ -z "$COMMAND" ]]; then
    echo "Usage: bash deploy.sh [--skip-vpn] <init|update|status>"
    exit 1
fi

# ── SSH multiplexing ──────────────────────────────────────────────────────────
SSH_CONTROL_DIR="/tmp/knowledgehub-deploy-ssh"
SSH_CONTROL_PATH="$SSH_CONTROL_DIR/control-%r@%h:%p"

SSH_OPTS=(
    -o StrictHostKeyChecking=no
    -o UserKnownHostsFile=/dev/null
    -o ControlMaster=auto
    -o "ControlPath=$SSH_CONTROL_PATH"
    -o ControlPersist=600
    -p "$SERVER_PORT"
)

setup_ssh_multiplexing() {
    echo "==> Establishing SSH master connection to $SERVER_USER@$SERVER_HOST..."
    mkdir -p "$SSH_CONTROL_DIR"
    sshpass -p "$SERVER_PASSWORD" ssh "${SSH_OPTS[@]}" -N -f "$SERVER_USER@$SERVER_HOST"
    echo "    SSH connection established."
}

cleanup_ssh_multiplexing() {
    echo "==> Closing SSH master connection..."
    ssh -o "ControlPath=$SSH_CONTROL_PATH" -O exit "$SERVER_USER@$SERVER_HOST" 2>/dev/null || true
    rm -rf "$SSH_CONTROL_DIR"
}

# Ensure cleanup on exit
trap 'cleanup_ssh_multiplexing 2>/dev/null || true' EXIT INT TERM

remote_exec() {
    local cmd="$1"
    sshpass -p "$SERVER_PASSWORD" ssh "${SSH_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "$cmd"
}

# ── Dependency checks ─────────────────────────────────────────────────────────
check_dependencies() {
    if ! command -v sshpass &>/dev/null; then
        echo "ERROR: sshpass is not installed."
        echo "       Install it with: brew install sshpass"
        exit 1
    fi
}

# ── VPN ───────────────────────────────────────────────────────────────────────
connect_vpn() {
    if [[ "$VPN_SKIP" == "true" || "$SKIP_VPN" == "true" ]]; then
        echo "==> Skipping VPN connection."
        return
    fi

    local VPN_SCRIPT="$SCRIPT_DIR/vpn-connect.sh"
    if [[ ! -f "$VPN_SCRIPT" ]]; then
        echo "WARNING: vpn-connect.sh not found — skipping VPN."
        return
    fi
    echo "==> Connecting to VPN..."
    bash "$VPN_SCRIPT"
}

# ── GitHub token URL ──────────────────────────────────────────────────────────
make_clone_url() {
    echo "$GITHUB_REPO" | sed "s|https://|https://$GITHUB_TOKEN@|"
}

# Resolve the client app directory on the remote server
client_dir() {
    if [[ -z "${CLIENT_SUBDIR:-}" || "$CLIENT_SUBDIR" == "." ]]; then
        echo "$SERVER_DEPLOY_PATH"
    else
        echo "$SERVER_DEPLOY_PATH/$CLIENT_SUBDIR"
    fi
}

# ── Build and deploy static files ─────────────────────────────────────────────
build_and_deploy() {
    local APP_DIR
    APP_DIR="$(client_dir)"

    echo "--> Installing dependencies..."
    remote_exec "cd $APP_DIR && npm install"

    echo "--> Building application..."
    remote_exec "cd $APP_DIR && npm run build"

    echo "--> Deploying: replacing $SERVER_WWW_PATH/glocal..."
    remote_exec "echo '$SERVER_PASSWORD' | sudo -S mkdir -p $SERVER_WWW_PATH"
    remote_exec "echo '$SERVER_PASSWORD' | sudo -S rm -rf $SERVER_WWW_PATH/glocal"
    remote_exec "echo '$SERVER_PASSWORD' | sudo -S mv $APP_DIR/build $SERVER_WWW_PATH/glocal"

    echo "    Deployed to $SERVER_WWW_PATH/glocal"
}

# ── Commands ──────────────────────────────────────────────────────────────────
cmd_init() {
    echo ""
    echo "========================================"
    echo "  KnowledgeHub — First-time Init"
    echo "========================================"

    # Check if deploy path already exists
    if remote_exec "test -d $SERVER_DEPLOY_PATH/.git" 2>/dev/null; then
        echo ""
        echo "WARNING: $SERVER_DEPLOY_PATH already contains a git repository."
        read -rp "         Re-clone (wipe existing)? [y/N] " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            remote_exec "rm -rf $SERVER_DEPLOY_PATH"
        else
            echo "         Keeping existing directory. Run 'update' instead."
            return
        fi
    fi

    local CLONE_URL
    CLONE_URL="$(make_clone_url)"

    echo "--> Cloning repository to $SERVER_DEPLOY_PATH..."
    remote_exec "echo '$SERVER_PASSWORD' | sudo -S mkdir -p $SERVER_DEPLOY_PATH"
    remote_exec "echo '$SERVER_PASSWORD' | sudo -S chown $SERVER_USER:$SERVER_USER $SERVER_DEPLOY_PATH"
    remote_exec "git clone --branch $GITHUB_BRANCH $CLONE_URL $SERVER_DEPLOY_PATH"

    echo "--> Persisting auth URL in remote origin..."
    remote_exec "cd $SERVER_DEPLOY_PATH && git remote set-url origin $CLONE_URL"

    build_and_deploy

    echo ""
    echo "Init complete. Static files deployed to $SERVER_WWW_PATH/glocal"
}

cmd_update() {
    echo ""
    echo "========================================"
    echo "  KnowledgeHub — Update Deployment"
    echo "========================================"

    local PULL_URL
    PULL_URL="$(make_clone_url)"

    echo "--> Pulling latest code from $GITHUB_BRANCH..."
    remote_exec "cd $SERVER_DEPLOY_PATH && git remote set-url origin $PULL_URL && git pull origin $GITHUB_BRANCH"

    build_and_deploy

    echo ""
    echo "Update complete. Static files deployed to $SERVER_WWW_PATH/glocal"
}

cmd_status() {
    echo "==> Deploy path: $SERVER_DEPLOY_PATH"
    remote_exec "cd $SERVER_DEPLOY_PATH && git log -1 --format='    Last commit: %h %s (%ar)'" 2>/dev/null \
        || echo "    Not yet cloned."
    echo ""
    echo "==> Live files: $SERVER_WWW_PATH/glocal"
    remote_exec "ls -la $SERVER_WWW_PATH/glocal 2>/dev/null | head -20 || echo '    Not yet deployed.'"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    check_dependencies
    connect_vpn
    setup_ssh_multiplexing

    case "$COMMAND" in
        init)    cmd_init    ;;
        update)  cmd_update  ;;
        status)  cmd_status  ;;
        *)
            echo "ERROR: Unknown command '$COMMAND'"
            echo "       Valid commands: init | update | status"
            exit 1
            ;;
    esac
}

main
