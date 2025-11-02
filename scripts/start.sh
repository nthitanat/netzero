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

# Check if .env exists in scripts directory
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "⚠️  Warning: .env file not found in scripts directory!"
    echo "📝 Please create the .env file with your configuration."
    echo ""
    echo "You can copy from the example:"
    echo "  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
    echo ""
    echo "Or run from project root:"
    echo "  cp scripts/.env.example scripts/.env"
    exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Using env file: $SCRIPT_DIR/.env"
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
docker-compose --env-file "$SCRIPT_DIR/.env" up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📊 Container Status:"
docker-compose --env-file "$SCRIPT_DIR/.env" ps

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
