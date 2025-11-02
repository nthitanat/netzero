#!/bin/bash
# Remote Deployment Script for NetZero Project
# This script connects to VPN, SSHs to remote server, and deploys the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
else
    echo -e "${RED}❌ Error: .env file not found in scripts directory${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Remote Deployment Process...${NC}"
echo ""

# FORCE PRODUCTION MODE for remote deployment
echo -e "${YELLOW}🔧 Forcing PRODUCTION mode for remote deployment...${NC}"
export DEPLOYMENT_MODE=production

# Create a temporary production .env file
TEMP_ENV_FILE=$(mktemp)
trap "rm -f $TEMP_ENV_FILE" EXIT

# Copy .env and override DEPLOYMENT_MODE
cp "$SCRIPT_DIR/.env" "$TEMP_ENV_FILE"
sed -i.bak 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' "$TEMP_ENV_FILE"
rm -f "$TEMP_ENV_FILE.bak"

echo -e "${GREEN}✅ Environment set to: PRODUCTION${NC}"
echo ""

# Step 1: Check VPN connection
echo -e "${BLUE}📡 Step 1: Checking VPN connection...${NC}"

VPN_CONNECTED=false
if pgrep -x "openconnect" > /dev/null; then
    echo -e "${GREEN}✅ VPN is already connected${NC}"
    VPN_CONNECTED=true
else
    echo -e "${YELLOW}⚠️  VPN is not connected. Connecting now...${NC}"
    
    # Run VPN connection script
    if [ -f "$SCRIPT_DIR/connect-vpn.sh" ]; then
        bash "$SCRIPT_DIR/connect-vpn.sh"
        VPN_CONNECTED=true
    else
        echo -e "${RED}❌ Error: connect-vpn.sh not found${NC}"
        exit 1
    fi
fi

# Wait a moment for VPN to stabilize
sleep 3

# Step 2: Test connection to remote server
echo ""
echo -e "${BLUE}🔌 Step 2: Testing connection to remote server...${NC}"

# Test if server is reachable
if ping -c 1 -W 2 "$REMOTE_HOST" &> /dev/null; then
    echo -e "${GREEN}✅ Remote server is reachable${NC}"
else
    echo -e "${RED}❌ Cannot reach remote server at $REMOTE_HOST${NC}"
    echo -e "${YELLOW}💡 Make sure VPN is connected and server is online${NC}"
    exit 1
fi

# Step 3: Ensure sshpass is installed for automated SSH
echo ""
echo -e "${BLUE}� Step 3: Checking SSH tools...${NC}"

if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}📦 Installing sshpass...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

echo -e "${GREEN}✅ SSH tools ready${NC}"

# Step 4: Deploy on remote server (git pull + build + docker-compose)
echo ""
echo -e "${BLUE}🚀 Step 4: Deploying on remote server...${NC}"

# Execute deployment commands on remote server
# We'll set the remote env vars inline so the remote shell has GITHUB token and repo url
sshpass -p "$REMOTE_PASSWORD" ssh -p "$REMOTE_PORT" \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "$REMOTE_USER@$REMOTE_HOST" "REMOTE_SUDO_PASS='$REMOTE_PASSWORD' GITHUB_TOKEN='$GITHUB_TOKEN' REPO_URL='$REPO_URL' bash -s" << 'ENDSSH'
set -e

echo "📂 Preparing repository on remote host..."

# Create /www directory if needed
echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www
echo "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www || true

DEPLOY_PATH=/www/netzero-deploy

if [ ! -d "$DEPLOY_PATH/.git" ]; then
    echo "Cloning repository into $DEPLOY_PATH..."
    git clone "https://${GITHUB_TOKEN}@${REPO_URL#https://}" "$DEPLOY_PATH"
else
    echo "Repository exists, pulling latest changes..."
    cd "$DEPLOY_PATH"
    git fetch --all --prune
    git reset --hard origin/main || git pull origin main
fi

echo "� Building client on remote server..."
cd "$DEPLOY_PATH/netzero-client"
# Use npm ci for reproducible installs
if [ -f package-lock.json ]; then
    npm ci
else
    npm install
fi

npm run build

echo "📁 Renaming build folder to netzero..."
cd "$DEPLOY_PATH/netzero-client"
mv build netzero

echo "📁 Deploying netzero to /www/wwwroot/engagement.chula.ac.th/..."
echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www/wwwroot/engagement.chula.ac.th
echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf /www/wwwroot/engagement.chula.ac.th/netzero || true
echo "$REMOTE_SUDO_PASS" | sudo -S mv "$DEPLOY_PATH/netzero-client/netzero" /www/wwwroot/engagement.chula.ac.th/
echo "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www/wwwroot/engagement.chula.ac.th 2>/dev/null || true

echo "🔧 Setting up environment for production..."
cd "$DEPLOY_PATH"
# Update .env in scripts directory if it exists
if [ -f scripts/.env ]; then
    sed -i 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' scripts/.env 2>/dev/null || true
fi

echo "🐳 Starting Docker containers in PRODUCTION mode..."
# Run docker-compose from netzero-deploy directory
cd "$DEPLOY_PATH"
docker-compose up -d --build

echo "🧹 Cleaning workspace (remote tmp)..."
rm -rf /tmp/* || true

echo "✅ Deployment complete!"

echo "\n📊 Container status:"
docker-compose ps

ENDSSH

# Step 5: Verify deployment
echo ""
echo -e "${BLUE}🔍 Step 5: Verifying deployment...${NC}"

sleep 5

# Check if services are responding
echo -e "${YELLOW}Testing API endpoint...${NC}"
if curl -f -s "http://$REMOTE_HOST:3001/api/v1/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API Server is responding${NC}"
else
    echo -e "${YELLOW}⚠️  API Server health check failed (may still be starting up)${NC}"
fi

echo -e "${YELLOW}Testing Chat Server endpoint...${NC}"
if curl -f -s "http://$REMOTE_HOST:3004/api/v1/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Chat Server is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Chat Server health check failed (may still be starting up)${NC}"
fi

echo -e "${YELLOW}Testing Web Client...${NC}"
if curl -f -s "http://$REMOTE_HOST" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Web Client is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Web Client health check failed (may still be starting up)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Completed Successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Access your application at:${NC}"
echo -e "   Web Client:  ${YELLOW}http://$REMOTE_HOST${NC}"
echo -e "   API Server:  ${YELLOW}http://$REMOTE_HOST:3001/api/v1${NC}"
echo -e "   Chat Server: ${YELLOW}http://$REMOTE_HOST:3004/api/v1${NC}"
echo ""
echo -e "${BLUE}📝 To view logs:${NC}"
echo -e "   ${YELLOW}ssh $REMOTE_USER@$REMOTE_HOST 'cd /www && docker-compose logs -f'${NC}"
echo ""
echo -e "${BLUE}🔌 To disconnect VPN:${NC}"
echo -e "   ${YELLOW}sudo kill \$(cat /var/run/openconnect.pid)${NC}"
echo ""
