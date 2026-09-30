#!/usr/bin/env bash
# Shared target/configuration contract. Sourced by local and remote entry points.
deployment_error() { printf 'Error: %s\n' "$*" >&2; return 1; }

select_frontends() {
  FRONTENDS=()
  case "$1" in
    netzero) FRONTENDS=(netzero) ;;
    glocal) FRONTENDS=(glocal) ;;
    both) FRONTENDS=(netzero glocal) ;;
    none) ;;
    *) deployment_error 'Frontend must be netzero, glocal, both, or none'; return 1 ;;
  esac
  case "$2" in
    deploy|skip) ;;
    *) deployment_error 'Backend must be deploy or skip'; return 1 ;;
  esac
}

require_settings() {
  local key
  for key in "$@"; do
    if [[ -z "${!key:-}" || "${!key}" == replace-me ]]; then
      deployment_error "Set $key in the root production environment"; return 1
    fi
  done
}

validate_deploy_config() {
  local frontend="$1" backend="$2"
  select_frontends "$frontend" "$backend" || return 1
  if [[ "$frontend" == none && "$backend" == skip ]]; then
    deployment_error 'Select at least one frontend or deploy the backend'; return 1
  fi
  [[ "${NODE_ENV:-}" == production ]] || { deployment_error 'Set NODE_ENV=production'; return 1; }
  require_settings REPO_URL || return 1
  if [[ "$frontend" != none ]]; then
    require_settings REACT_APP_API_BASE_URL || return 1
  fi
  if [[ "$frontend" == netzero || "$frontend" == both ]]; then
    require_settings REACT_APP_CHAT_API_BASE_URL REACT_APP_USE_REAL_TREE_API || return 1
  fi
  if [[ "$backend" == deploy ]]; then
    require_settings PORT API_PREFIX API_VERSION DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME \
      JWT_SECRET JWT_EXPIRES_IN CORS_ORIGIN UPLOAD_DIR MAX_FILE_SIZE \
      RATE_LIMIT_WINDOW_MS RATE_LIMIT_MAX_REQUESTS CHAT_PORT CHAT_DB_HOST CHAT_DB_PORT \
      CHAT_DB_USER CHAT_DB_PASSWORD CHAT_DB_NAME CHAT_JWT_SECRET CHAT_JWT_EXPIRES_IN \
      OPENAI_API_KEY CHAT_VECTOR_STORE_ID CHAT_CORS_ORIGINS || return 1
  fi
}

export_client_settings() {
  # Public allowlist: never export the root's database/provider/deployment secrets.
  local target="$1" key api="${REACT_APP_API_BASE_URL:-}" chat="${REACT_APP_CHAT_API_BASE_URL:-}"
  local trees="${REACT_APP_USE_REAL_TREE_API:-}" assets="${REACT_APP_STATIC_ASSET_BASE_URL:-}"
  while IFS= read -r key; do unset "$key"; done < <(compgen -e | sed -n '/^REACT_APP_/p')
  export REACT_APP_API_BASE_URL="$api"
  if [[ "$target" == netzero ]]; then
    export REACT_APP_CHAT_API_BASE_URL="$chat" REACT_APP_USE_REAL_TREE_API="$trees" REACT_APP_STATIC_ASSET_BASE_URL="$assets"
    unset PUBLIC_URL
  else
    export PUBLIC_URL=/glocal
  fi
}

check_client_env_files() {
  local path
  for path in "$1"/.env "$1"/.env.*; do
    [[ -f "$path" && "$path" != *.example ]] || continue
    deployment_error "Remove client-local environment file $path; use the repository root"; return 1
  done
}
