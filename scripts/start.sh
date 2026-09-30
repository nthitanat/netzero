#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

if [[ ! -f .env.development ]]; then
  echo 'Missing .env.development' >&2
  exit 1
fi
if ! grep -qx 'NODE_ENV=development' .env.development; then
  echo 'Set NODE_ENV=development in .env.development' >&2
  exit 1
fi

frontend="${1:-both}"
case "$frontend" in
  netzero|glocal|both) profiles=(--profile "$frontend") ;;
  none) profiles=() ;;
  *) echo 'Usage: bash scripts/start.sh [netzero|glocal|both|none]' >&2; exit 1 ;;
esac
docker compose --env-file .env.development -f docker-compose.dev.yml ${profiles[@]+"${profiles[@]}"} up -d --build
docker compose --env-file .env.development -f docker-compose.dev.yml ${profiles[@]+"${profiles[@]}"} ps

set -a
source .env.development
set +a
if [[ "$frontend" == netzero || "$frontend" == both ]]; then
  echo "NetZero: http://localhost:${CLIENT_PORT:-3000}"
fi
if [[ "$frontend" == glocal || "$frontend" == both ]]; then
  echo "Glocal: http://localhost:${GLOCAL_CLIENT_PORT:-3002}/glocal/"
fi
echo "API: http://localhost:${PORT:-3001}${API_PREFIX:-/api}/${API_VERSION:-v1}"
echo "Chat API: http://localhost:${CHAT_PORT:-3004}${API_PREFIX:-/api}/${API_VERSION:-v1}"
