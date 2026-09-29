#!/bin/bash
# VPN Disconnection Script

set -e  # Exit on any error

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    source "$PROJECT_ROOT/.env.production"
fi

local_sudo() {
    if [ -z "${SUDO_PASSWORD:-}" ]; then
        echo "❌ Set SUDO_PASSWORD in .env.production for local sudo" >&2
        return 1
    fi
    printf '%s\n' "$SUDO_PASSWORD" | sudo -k -S -p '' "$@"
}

echo "🔌 Disconnecting from VPN..."

# Check if openconnect is running
if pgrep -x "openconnect" > /dev/null; then
    # Check if PID file exists
    if [ -f /var/run/openconnect.pid ]; then
        echo "⚠️  This script requires sudo privileges"
        local_sudo kill "$(cat /var/run/openconnect.pid)"
        local_sudo rm -f /var/run/openconnect.pid
        echo "✅ VPN disconnected successfully"
    else
        echo "⚠️  PID file not found, killing all openconnect processes"
        local_sudo killall openconnect
        echo "✅ VPN disconnected"
    fi
else
    echo "ℹ️  VPN is not connected"
fi
