#!/usr/bin/env bash
# scripts/connect-vpn.sh
# Connect to Chula VPN using openconnect (fully scriptable).
# Reads VPN_HOST, VPN_USERNAME, VPN_PASSWORD, SUDO_PASSWORD from .env
# in the project root (two levels up from this script).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: .env not found at $ENV_FILE" >&2
    exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

# ── Check dependencies ────────────────────────────────────────
if ! command -v openconnect &>/dev/null; then
    echo "ERROR: openconnect is not installed. Install with: brew install openconnect" >&2
    exit 1
fi

# ── Skip if already connected ─────────────────────────────────
if pgrep -x openconnect &>/dev/null; then
    echo "VPN already connected. Skipping."
    exit 0
fi

echo "Connecting to VPN: $VPN_HOST ..."

# Pre-validate sudo token so openconnect's sudo call doesn't prompt
echo "$SUDO_PASSWORD" | sudo -S -v 2>/dev/null

# Write password to a temp file (avoid it appearing in process list)
CRED_FILE="$(mktemp)"
echo "$VPN_PASSWORD" > "$CRED_FILE"
trap 'rm -f "$CRED_FILE"' EXIT

# Connect in background
sudo openconnect \
    --background \
    --pid-file=/var/run/openconnect.pid \
    --passwd-on-stdin \
    --user="$VPN_USERNAME" \
    "$VPN_HOST" < "$CRED_FILE"

# Give it a moment to establish the tunnel
sleep 3

if pgrep -x openconnect &>/dev/null; then
    echo "VPN connected successfully."
else
    echo "ERROR: openconnect exited unexpectedly. Check credentials or VPN host." >&2
    exit 1
fi
