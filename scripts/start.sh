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

docker compose --env-file .env.development -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.development -f docker-compose.dev.yml ps

echo 'Client: http://localhost:3000'
echo 'API: http://localhost:3001/api/v1'
echo 'Chat API: http://localhost:3004/api/v1'
