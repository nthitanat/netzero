#!/usr/bin/env bash
# Native CRA start/build with the same root public configuration as Compose.
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$project_root/scripts/deploy-targets.sh"
environment="${1:-development}" target="${2:-netzero}" command="${3:-start}"
case "$environment" in development|production) ;; *) deployment_error 'Environment must be development or production'; exit 1 ;; esac
case "$target" in netzero|glocal) ;; *) deployment_error 'Client must be netzero or glocal'; exit 1 ;; esac
case "$command" in start|build) ;; *) deployment_error 'Command must be start or build'; exit 1 ;; esac
env_file="$project_root/.env.$environment"
[[ -f "$env_file" ]] || { deployment_error "Missing $env_file"; exit 1; }
source "$env_file"
[[ "${NODE_ENV:-}" == "$environment" ]] || { deployment_error 'NODE_ENV must match the selected environment'; exit 1; }
require_settings REACT_APP_API_BASE_URL
check_client_env_files "$project_root/$target-client"
export_client_settings "$target"
if [[ "$command" == start ]]; then
  if [[ "$target" == glocal ]]; then export PORT="${GLOCAL_CLIENT_PORT:-3002}"; else export PORT="${CLIENT_PORT:-3000}"; fi
fi
cd "$project_root/$target-client"
exec npm run "$command"
