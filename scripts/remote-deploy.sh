#!/bin/bash#!/bin/bash

# Remote Deployment Script for NetZero Project# Remote Deployment Script for NetZero Project

# This script connects to VPN, SSHs to remote server, and deploys the application# This script connects to VPN, SSHs to remote server, and deploys the application



set -e  # Exit on any errorset -e  # Exit on any error



# Colors for output# Colors for output

RED='\033[0;31m'RED='\033[0;31m'

GREEN='\033[0;32m'GREEN='\033[0;32m'

YELLOW='\033[1;33m'YELLOW='\033[1;33m'

BLUE='\033[0;34m'BLUE='\033[0;34m'

NC='\033[0m' # No ColorNC='\033[0m' # No Color



# Load environment variables# Load environment variables

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/.env" ]; thenif [ -f "$SCRIPT_DIR/.env" ]; then

    source "$SCRIPT_DIR/.env"    source "$SCRIPT_DIR/.env"

elseelse

    echo -e "${RED}❌ Error: .env file not found in scripts directory${NC}"    echo -e "${RED}❌ Error: .env file not found in scripts directory${NC}"

    exit 1    exit 1

fifi



echo -e "${BLUE}🚀 Remote Server Management Script${NC}"echo -e "${BLUE}🚀 Remote Server Management Script${NC}"

echo ""echo ""



# Show menu for action selection# Show menu for action selection

echo -e "${YELLOW}Select an action:${NC}"echo -e "${YELLOW}Select an action:${NC}"

echo "1) Full Deploy (git pull + build + restart containers)"echo "1) Full Deploy (git pull + build + restart containers)"

echo "2) Start containers"echo "2) Start containers"

echo "3) Stop containers"echo "3) Stop containers"

echo "4) Restart containers"echo "4) Restart containers"

echo "5) View logs"echo "5) View logs"

echo "6) Container status"echo "6) Container status"

echo ""echo ""

read -p "Enter your choice [1-6]: " ACTION_CHOICEread -p "Enter your choice [1-6]: " ACTION_CHOICE



case $ACTION_CHOICE incase $ACTION_CHOICE in

    1) ACTION="deploy" ;;    1) ACTION="deploy" ;;

    2) ACTION="start" ;;    2) ACTION="start" ;;

    3) ACTION="stop" ;;    3) ACTION="stop" ;;

    4) ACTION="restart" ;;    4) ACTION="restart" ;;

    5) ACTION="logs" ;;    5) ACTION="logs" ;;

    6) ACTION="status" ;;    6) ACTION="status" ;;

    *)    *)

        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"

        exit 1        exit 1

        ;;        ;;

esacesac



echo ""echo ""

echo -e "${GREEN}✅ Action selected: $ACTION${NC}"echo -e "${GREEN}✅ Action selected: $ACTION${NC}"

echo ""echo ""



# FORCE PRODUCTION MODE for remote operations# FORCE PRODUCTION MODE for remote deployment

echo -e "${YELLOW}🔧 Forcing PRODUCTION mode for remote operations...${NC}"echo -e "${YELLOW}🔧 Forcing PRODUCTION mode for remote operations...${NC}"

export DEPLOYMENT_MODE=productionexport DEPLOYMENT_MODE=production



# Create a temporary production .env file# Create a temporary production .env file

TEMP_ENV_FILE=$(mktemp)TEMP_ENV_FILE=$(mktemp)

trap "rm -f $TEMP_ENV_FILE" EXITtrap "rm -f $TEMP_ENV_FILE" EXIT



# Copy .env and override DEPLOYMENT_MODE# Copy .env and override DEPLOYMENT_MODE

cp "$SCRIPT_DIR/.env" "$TEMP_ENV_FILE"cp "$SCRIPT_DIR/.env" "$TEMP_ENV_FILE"

sed -i.bak 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' "$TEMP_ENV_FILE"sed -i.bak 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' "$TEMP_ENV_FILE"

rm -f "$TEMP_ENV_FILE.bak"rm -f "$TEMP_ENV_FILE.bak"



echo -e "${GREEN}✅ Environment set to: PRODUCTION${NC}"echo -e "${GREEN}✅ Environment set to: PRODUCTION${NC}"

echo ""echo ""



# Step 1: Check VPN connection# Step 1: Check VPN connection

echo -e "${BLUE}📡 Step 1: Checking VPN connection...${NC}"echo -e "${BLUE}📡 Step 1: Checking VPN connection...${NC}"



VPN_CONNECTED=falseVPN_CONNECTED=false

if pgrep -x "openconnect" > /dev/null; thenif pgrep -x "openconnect" > /dev/null; then

    echo -e "${GREEN}✅ VPN is already connected${NC}"    echo -e "${GREEN}✅ VPN is already connected${NC}"

    VPN_CONNECTED=true    VPN_CONNECTED=true

elseelse

    echo -e "${YELLOW}⚠️  VPN is not connected. Connecting now...${NC}"    echo -e "${YELLOW}⚠️  VPN is not connected. Connecting now...${NC}"

        

    # Run VPN connection script    # Run VPN connection script

    if [ -f "$SCRIPT_DIR/connect-vpn.sh" ]; then    if [ -f "$SCRIPT_DIR/connect-vpn.sh" ]; then

        bash "$SCRIPT_DIR/connect-vpn.sh"        bash "$SCRIPT_DIR/connect-vpn.sh"

        VPN_CONNECTED=true        VPN_CONNECTED=true

    else    else

        echo -e "${RED}❌ Error: connect-vpn.sh not found${NC}"        echo -e "${RED}❌ Error: connect-vpn.sh not found${NC}"

        exit 1        exit 1

    fi    fi

fifi



# Wait a moment for VPN to stabilize# Wait a moment for VPN to stabilize

sleep 3sleep 3



# Step 2: Test connection to remote server# Step 2: Test connection to remote server

echo ""echo ""

echo -e "${BLUE}🔌 Step 2: Testing connection to remote server...${NC}"echo -e "${BLUE}🔌 Step 2: Testing connection to remote server...${NC}"



# Test if server is reachable# Test if server is reachable

if ping -c 1 -W 2 "$REMOTE_HOST" &> /dev/null; thenif ping -c 1 -W 2 "$REMOTE_HOST" &> /dev/null; then

    echo -e "${GREEN}✅ Remote server is reachable${NC}"    echo -e "${GREEN}✅ Remote server is reachable${NC}"

elseelse

    echo -e "${RED}❌ Cannot reach remote server at $REMOTE_HOST${NC}"    echo -e "${RED}❌ Cannot reach remote server at $REMOTE_HOST${NC}"

    echo -e "${YELLOW}💡 Make sure VPN is connected and server is online${NC}"    echo -e "${YELLOW}💡 Make sure VPN is connected and server is online${NC}"

    exit 1    exit 1

fifi



# Step 3: Ensure sshpass is installed for automated SSH# Step 3: Ensure sshpass is installed for automated SSH

echo ""echo ""

echo -e "${BLUE}🔑 Step 3: Checking SSH tools...${NC}"echo -e "${BLUE}� Step 3: Checking SSH tools...${NC}"



if ! command -v sshpass &> /dev/null; thenif ! command -v sshpass &> /dev/null; then

    echo -e "${YELLOW}📦 Installing sshpass...${NC}"    echo -e "${YELLOW}📦 Installing sshpass...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then    if [[ "$OSTYPE" == "darwin"* ]]; then

        brew install hudochenkov/sshpass/sshpass        brew install hudochenkov/sshpass/sshpass

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then

        sudo apt-get update && sudo apt-get install -y sshpass        sudo apt-get update && sudo apt-get install -y sshpass

    fi    fi

fifi



echo -e "${GREEN}✅ SSH tools ready${NC}"echo -e "${GREEN}✅ SSH tools ready${NC}"



# Step 4: Execute action on remote server# Step 4: Execute action on remote server

echo ""echo ""

echo -e "${BLUE}🚀 Step 4: Executing action on remote server...${NC}"echo -e "${BLUE}🚀 Step 4: Executing action on remote server...${NC}"



# Execute commands on remote server based on selected action# Execute commands on remote server based on selected action

# We'll set the remote env vars inline so the remote shell has GITHUB token and repo url# We'll set the remote env vars inline so the remote shell has GITHUB token and repo url

sshpass -p "$REMOTE_PASSWORD" ssh -p "$REMOTE_PORT" \sshpass -p "$REMOTE_PASSWORD" ssh -p "$REMOTE_PORT" \

    -o StrictHostKeyChecking=no \    -o StrictHostKeyChecking=no \

    -o UserKnownHostsFile=/dev/null \    -o UserKnownHostsFile=/dev/null \

    "$REMOTE_USER@$REMOTE_HOST" "REMOTE_SUDO_PASS='$REMOTE_PASSWORD' GITHUB_TOKEN='$GITHUB_TOKEN' REPO_URL='$REPO_URL' ACTION='$ACTION' bash -s" << 'ENDSSH'    "$REMOTE_USER@$REMOTE_HOST" "REMOTE_SUDO_PASS='$REMOTE_PASSWORD' GITHUB_TOKEN='$GITHUB_TOKEN' REPO_URL='$REPO_URL' ACTION='$ACTION' bash -s" << 'ENDSSH'

set -eset -e



DEPLOY_PATH=/www/netzero-deployecho "📂 Preparing repository on remote host..."



# Function to deploy# Create /www directory if needed

deploy_app() {echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www

    echo "📂 Preparing repository on remote host..."echo "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www || true



    # Create /www directory if neededDEPLOY_PATH=/www/netzero-deploy

    echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www

    echo "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www || trueif [ ! -d "$DEPLOY_PATH/.git" ]; then

    echo "Cloning repository into $DEPLOY_PATH..."

    if [ ! -d "$DEPLOY_PATH/.git" ]; then    git clone "https://${GITHUB_TOKEN}@${REPO_URL#https://}" "$DEPLOY_PATH"

        echo "Cloning repository into $DEPLOY_PATH..."else

        git clone "https://${GITHUB_TOKEN}@${REPO_URL#https://}" "$DEPLOY_PATH"    echo "Repository exists, pulling latest changes..."

    else    cd "$DEPLOY_PATH"

        echo "Repository exists, pulling latest changes..."    git fetch --all --prune

        cd "$DEPLOY_PATH"    git reset --hard origin/main || git pull origin main

        git fetch --all --prunefi

        git reset --hard origin/main || git pull origin main

    fiecho "� Building client on remote server..."

cd "$DEPLOY_PATH/netzero-client"

    echo "🏗️ Building client on remote server..."# Use npm ci for reproducible installs

    cd "$DEPLOY_PATH/netzero-client"if [ -f package-lock.json ]; then

    # Use npm ci for reproducible installs    npm ci

    if [ -f package-lock.json ]; thenelse

        npm ci    npm install

    elsefi

        npm install

    finpm run build



    npm run buildecho "📁 Renaming build folder to netzero..."

cd "$DEPLOY_PATH/netzero-client"

    echo "📁 Renaming build folder to netzero..."mv build netzero

    cd "$DEPLOY_PATH/netzero-client"

    mv build netzeroecho "📁 Deploying netzero to /www/wwwroot/engagement.chula.ac.th/..."

echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www/wwwroot/engagement.chula.ac.th

    echo "📁 Deploying netzero to /www/wwwroot/engagement.chula.ac.th/..."echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf /www/wwwroot/engagement.chula.ac.th/netzero || true

    echo "$REMOTE_SUDO_PASS" | sudo -S mkdir -p /www/wwwroot/engagement.chula.ac.thecho "$REMOTE_SUDO_PASS" | sudo -S mv "$DEPLOY_PATH/netzero-client/netzero" /www/wwwroot/engagement.chula.ac.th/

    echo "$REMOTE_SUDO_PASS" | sudo -S rm -rf /www/wwwroot/engagement.chula.ac.th/netzero || trueecho "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www/wwwroot/engagement.chula.ac.th 2>/dev/null || true

    echo "$REMOTE_SUDO_PASS" | sudo -S mv "$DEPLOY_PATH/netzero-client/netzero" /www/wwwroot/engagement.chula.ac.th/

    echo "$REMOTE_SUDO_PASS" | sudo -S chown -R $USER:$USER /www/wwwroot/engagement.chula.ac.th 2>/dev/null || trueecho "🔧 Setting up environment for production..."

cd "$DEPLOY_PATH"

    echo "🔧 Setting up environment for production..."# Update .env in scripts directory if it exists

    cd "$DEPLOY_PATH"if [ -f scripts/.env ]; then

    # Update .env in scripts directory if it exists    sed -i 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' scripts/.env 2>/dev/null || true

    if [ -f scripts/.env ]; thenfi

        sed -i 's/^DEPLOYMENT_MODE=.*/DEPLOYMENT_MODE=production/' scripts/.env 2>/dev/null || true

    fiecho "🐳 Starting Docker containers in PRODUCTION mode..."

# Run docker-compose from netzero-deploy directory

    echo "🐳 Starting Docker containers in PRODUCTION mode..."cd "$DEPLOY_PATH"

    # Run docker-compose from netzero-deploy directoryecho "$REMOTE_SUDO_PASS" | sudo -S docker-compose up -d --build

    cd "$DEPLOY_PATH"

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose up -d --buildecho "🧹 Cleaning workspace (remote tmp)..."

rm -rf /tmp/* || true

    echo "🧹 Cleaning workspace (remote tmp)..."

    rm -rf /tmp/* || trueecho "✅ Deployment complete!"



    echo "✅ Deployment complete!"echo "\n📊 Container status:"

echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose ps

    echo ""

    echo "📊 Container status:"ENDSSH

    cd "$DEPLOY_PATH"

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose ps# Step 5: Verify deployment

}echo ""

echo -e "${BLUE}🔍 Step 5: Verifying deployment...${NC}"

# Function to start containers

start_containers() {sleep 5

    echo "🚀 Starting Docker containers..."

    cd "$DEPLOY_PATH"# Check if services are responding

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose up -decho -e "${YELLOW}Testing API endpoint...${NC}"

    echo "✅ Containers started!"if curl -f -s "http://$REMOTE_HOST:3001/api/v1/health" > /dev/null 2>&1; then

    echo ""    echo -e "${GREEN}✅ API Server is responding${NC}"

    echo "📊 Container status:"else

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose ps    echo -e "${YELLOW}⚠️  API Server health check failed (may still be starting up)${NC}"

}fi



# Function to stop containersecho -e "${YELLOW}Testing Chat Server endpoint...${NC}"

stop_containers() {if curl -f -s "http://$REMOTE_HOST:3004/api/v1/health" > /dev/null 2>&1; then

    echo "🛑 Stopping Docker containers..."    echo -e "${GREEN}✅ Chat Server is responding${NC}"

    cd "$DEPLOY_PATH"else

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose down    echo -e "${YELLOW}⚠️  Chat Server health check failed (may still be starting up)${NC}"

    echo "✅ Containers stopped!"fi

}

echo -e "${YELLOW}Testing Web Client...${NC}"

# Function to restart containersif curl -f -s "http://$REMOTE_HOST" > /dev/null 2>&1; then

restart_containers() {    echo -e "${GREEN}✅ Web Client is responding${NC}"

    echo "🔄 Restarting Docker containers..."else

    cd "$DEPLOY_PATH"    echo -e "${YELLOW}⚠️  Web Client health check failed (may still be starting up)${NC}"

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose restartfi

    echo "✅ Containers restarted!"

    echo ""# Summary

    echo "📊 Container status:"echo ""

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose psecho -e "${GREEN}═══════════════════════════════════════════════${NC}"

}echo -e "${GREEN}🎉 Deployment Completed Successfully!${NC}"

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Function to view logsecho ""

view_logs() {echo -e "${BLUE}🌐 Access your application at:${NC}"

    echo "📋 Viewing container logs (Press Ctrl+C to exit)..."echo -e "   Web Client:  ${YELLOW}http://$REMOTE_HOST${NC}"

    cd "$DEPLOY_PATH"echo -e "   API Server:  ${YELLOW}http://$REMOTE_HOST:3001/api/v1${NC}"

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose logs -f --tail=100echo -e "   Chat Server: ${YELLOW}http://$REMOTE_HOST:3004/api/v1${NC}"

}echo ""

echo -e "${BLUE}📝 To view logs:${NC}"

# Function to show statusecho -e "   ${YELLOW}ssh $REMOTE_USER@$REMOTE_HOST 'cd /www && docker-compose logs -f'${NC}"

show_status() {echo ""

    echo "📊 Container status:"echo -e "${BLUE}🔌 To disconnect VPN:${NC}"

    cd "$DEPLOY_PATH"echo -e "   ${YELLOW}sudo kill \$(cat /var/run/openconnect.pid)${NC}"

    echo "$REMOTE_SUDO_PASS" | sudo -S docker-compose psecho ""

    echo ""
    echo "💾 Disk usage:"
    echo "$REMOTE_SUDO_PASS" | sudo -S docker system df
}

# Execute action based on choice
case $ACTION in
    deploy)
        deploy_app
        ;;
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    logs)
        view_logs
        ;;
    status)
        show_status
        ;;
    *)
        echo "❌ Unknown action: $ACTION"
        exit 1
        ;;
esac

ENDSSH

# Step 5: Post-execution actions based on action type
echo ""

if [ "$ACTION" == "deploy" ]; then
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
elif [ "$ACTION" == "logs" ]; then
    echo -e "${GREEN}✅ Log viewing session ended${NC}"
else
    echo -e "${GREEN}✅ Action '$ACTION' completed successfully!${NC}"
fi

echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "   View logs:   ${YELLOW}./remote-deploy.sh${NC} (select option 5)"
echo -e "   Start:       ${YELLOW}./remote-deploy.sh${NC} (select option 2)"
echo -e "   Stop:        ${YELLOW}./remote-deploy.sh${NC} (select option 3)"
echo -e "   Restart:     ${YELLOW}./remote-deploy.sh${NC} (select option 4)"
echo -e "   Status:      ${YELLOW}./remote-deploy.sh${NC} (select option 6)"
echo ""
echo -e "${BLUE}🔌 To disconnect VPN:${NC}"
echo -e "   ${YELLOW}sudo kill \$(cat /var/run/openconnect.pid)${NC}"
echo ""
