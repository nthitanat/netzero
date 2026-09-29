#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

volume_name=netzero-dev-mysql-data
read -r -p "Type $volume_name to delete only the development database volume: " confirmation
if [[ "$confirmation" != "$volume_name" ]]; then
  echo 'Cancelled; no containers or volumes changed.' >&2
  exit 1
fi

docker compose --env-file .env.development -f docker-compose.dev.yml down
docker volume rm "$volume_name"
echo 'Database volume removed. Run scripts/start.sh to create and seed a new one.'
