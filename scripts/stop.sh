#!/bin/bash
# Stop all Docker containers

set -e

echo "🛑 Stopping NetZero Application..."

# Determine the correct paths based on where script is run from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
[ ! -f "$ENV_FILE" ] && ENV_FILE="$SCRIPT_DIR/.env"

# Change to project root to run docker-compose
cd "$PROJECT_ROOT"

docker-compose --env-file "$ENV_FILE" down

echo ""
echo "✅ All containers stopped"
echo ""
echo "To remove volumes as well (⚠️  this will delete database data):"
echo "   docker-compose down -v"
echo ""
