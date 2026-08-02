#!/bin/bash
# Quick start script for local development

set -e

echo "🚀 Starting NetZero Application with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo ""
    echo "To start Docker:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for Docker to start (green indicator)"
    echo "  3. Run this script again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Determine the correct paths based on where script is run from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if .env exists in project root (primary) or scripts directory (fallback)
if [ -f "$PROJECT_ROOT/.env" ]; then
    ENV_FILE="$PROJECT_ROOT/.env"
elif [ -f "$SCRIPT_DIR/.env" ]; then
    ENV_FILE="$SCRIPT_DIR/.env"
else
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please create the .env file in the project root."
    echo ""
    echo "Expected location: $PROJECT_ROOT/.env"
    exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Using env file: $ENV_FILE"
echo ""

# Kill processes using required ports
echo "🔍 Checking for processes on ports 3000, 3001, 3004, 80..."
PORTS=(3000 3001 3004 80)

for PORT in "${PORTS[@]}"; do
    if lsof -ti :$PORT >/dev/null 2>&1; then
        PID=$(lsof -ti :$PORT 2>/dev/null | head -1)
        if [ ! -z "$PID" ]; then
            echo "   ⚠️  Port $PORT is in use by PID $PID, killing process..."
            if [ "$PORT" -eq 80 ]; then
                # Port 80 might need sudo
                sudo kill -9 $PID 2>/dev/null || kill -9 $PID 2>/dev/null || true
            else
                kill -9 $PID 2>/dev/null || true
            fi
            sleep 0.5
        fi
    fi
done

echo "✅ All ports are clear"
echo ""

# Change to project root to run docker-compose
cd "$PROJECT_ROOT"

echo "🐳 Building and starting containers in ${DEPLOYMENT_MODE:-development} mode..."
docker-compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📊 Container Status:"
docker-compose --env-file "$ENV_FILE" ps

echo ""
echo "✅ Application is starting up!"
echo ""
echo "🌐 Access your application at:"
echo "   Web Client:  http://localhost:3000"
echo "   API Server:  http://localhost:3001/api/v1"
echo "   Chat Server: http://localhost:3004/api/v1"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""
