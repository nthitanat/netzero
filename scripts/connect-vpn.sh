#!/bin/bash
# VPN Connection Script for Chula VPN
# This script connects to vpn.chula.ac.th VPN

set -e  # Exit on any error

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    source "$PROJECT_ROOT/.env.production"
else
    echo "❌ Error: .env.production file not found in project root"
    exit 1
fi

local_sudo() {
    if [ -z "${SUDO_PASSWORD:-}" ]; then
        echo "❌ Set SUDO_PASSWORD in .env.production for local sudo" >&2
        return 1
    fi
    printf '%s\n' "$SUDO_PASSWORD" | sudo -k -S -p '' "$@"
}

# Validate the local sudo password before installing tools or connecting.
local_sudo -v

echo "🔐 Connecting to Chula VPN..."

# Check if openconnect is installed
if ! command -v openconnect &> /dev/null; then
    echo "❌ openconnect is not installed."
    echo "📦 Installing openconnect..."
    
    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install openconnect
        else
            echo "❌ Homebrew is not installed. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            local_sudo apt-get update
            local_sudo apt-get install -y openconnect
        elif command -v yum &> /dev/null; then
            local_sudo yum install -y openconnect
        else
            echo "❌ Unable to install openconnect automatically. Please install it manually."
            exit 1
        fi
    else
        echo "❌ Unsupported operating system"
        exit 1
    fi
fi

echo "📡 Establishing VPN connection to $VPN_HOST..."

# Connect to VPN (this will run in background)
# Note: local_sudo supplies the password to each sudo invocation.

# Create a script that will be run with sudo
SUDO_SCRIPT=$(mktemp)
CRED_FILE=$(mktemp)
trap "rm -f $SUDO_SCRIPT $CRED_FILE" EXIT
chmod 600 "$SUDO_SCRIPT" "$CRED_FILE"

# Write VPN credentials to file
echo "$VPN_PASSWORD" > "$CRED_FILE"

cat > "$SUDO_SCRIPT" <<EOFSCRIPT
#!/bin/bash
openconnect \
    --background \
    --pid-file=/var/run/openconnect.pid \
    --user="$VPN_USERNAME" \
    --passwd-on-stdin \
    "$VPN_HOST" < "$CRED_FILE"
EOFSCRIPT

chmod +x "$SUDO_SCRIPT"

# Run the script with the configured local sudo password.
local_sudo bash "$SUDO_SCRIPT"

# Wait a moment for connection to establish
sleep 5

# Check if VPN is connected
if pgrep -x "openconnect" > /dev/null; then
    echo "✅ VPN connection established successfully"
    echo "📌 PID file: /var/run/openconnect.pid"
    echo ""
    echo "To disconnect VPN later, run:"
    echo "   sudo kill \$(cat /var/run/openconnect.pid)"
    exit 0
else
    echo "❌ Failed to establish VPN connection"
    exit 1
fi
