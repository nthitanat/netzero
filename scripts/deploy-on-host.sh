#!/usr/bin/env bash
# Invoked through the shared local entry point; also testable against an isolated host.
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$script_dir/deploy-targets.sh"
ACTION="${1:?Action required}" FRONTEND="${2:?Frontend required}" BACKEND="${3:?Backend required}"
ENV_UPLOAD="${4:?Environment upload required}"
source "$ENV_UPLOAD"
select_frontends "$FRONTEND" "$BACKEND"
case "$ACTION" in deploy|start|stop|restart|logs|status) ;; *) deployment_error 'Unknown action'; exit 1 ;; esac
if [[ "$ACTION" == deploy ]]; then validate_deploy_config "$FRONTEND" "$BACKEND"; fi
DEPLOY_PATH="${DEPLOY_PATH:-/www/netzero-deploy}"
WEB_ROOT="${WEB_ROOT:-/www/wwwroot/engagement.chula.ac.th}"
PUBLIC_SITE_URL="${PUBLIC_SITE_URL:-https://engagement.chula.ac.th}"
for path in "$DEPLOY_PATH" "$WEB_ROOT"; do
  [[ "$path" == /* && "$path" != / ]] || { deployment_error 'Deployment paths must be absolute directories below /'; exit 1; }
done
REMOTE_SUDO_PASS="${REMOTE_SUDO_PASSWORD:-${REMOTE_PASSWORD:-}}"
require_settings REMOTE_SUDO_PASS
remote_sudo() { printf '%s\n' "$REMOTE_SUDO_PASS" | sudo -k -S -p '' "$@"; }
compose() { remote_sudo docker compose --env-file "$DEPLOY_PATH/.env.production" -f "$DEPLOY_PATH/docker-compose.prod.yml" "$@"; }

# Serialize checkout/build/publication, including backend management operations.
command -v flock >/dev/null || { deployment_error 'Install flock on the deployment host'; exit 1; }
lock_key="$(printf '%s' "$DEPLOY_PATH" | cksum | cut -d ' ' -f 1)"
exec 9>"/tmp/netzero-deploy-$lock_key.lock"
flock -n 9 || { deployment_error 'Another deployment is running'; exit 1; }

release_id="$(date -u +%Y%m%dT%H%M%SZ)-$$"
build_dir="$DEPLOY_PATH/.frontend-builds/$release_id"
stage_dir="$WEB_ROOT/.netzero-stage-$release_id"
backup_dir="$WEB_ROOT/.netzero-releases/$release_id"
changed=()
on_exit() {
  local status=$? target
  trap - EXIT
  if [[ "$status" -ne 0 && ${#changed[@]} -gt 0 ]]; then
    echo 'Deployment failed; restoring selected frontend builds.' >&2
    for target in "${changed[@]}"; do
      remote_sudo rm -rf -- "$WEB_ROOT/$target" || true
      if [[ -d "$backup_dir/$target" ]]; then
        remote_sudo mv -- "$backup_dir/$target" "$WEB_ROOT/$target" || echo "Restore failed for $target; previous build remains in $backup_dir" >&2
      fi
    done
  fi
  if [[ "$ACTION" == deploy ]]; then
    remote_sudo rm -rf -- "$stage_dir" || true
    rm -rf -- "$build_dir"
  fi
  exit "$status"
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

refresh_repository() {
  remote_sudo mkdir -p "$DEPLOY_PATH"
  # Never chown the uploaded image directory or production MySQL data.
  remote_sudo chown "$(id -u):$(id -g)" "$DEPLOY_PATH"
  local askpass
  askpass="$(mktemp)"
  printf '%s\n' '#!/bin/sh' 'case "$1" in *Username*) printf "%s\n" x-access-token ;; *) printf "%s\n" "$GITHUB_TOKEN" ;; esac' > "$askpass"
  chmod 700 "$askpass"
  if [[ -d "$DEPLOY_PATH/.git" ]]; then
    if ! GITHUB_TOKEN="${GITHUB_TOKEN:-}" GIT_ASKPASS="$askpass" GIT_TERMINAL_PROMPT=0 git -C "$DEPLOY_PATH" fetch "$REPO_URL" main; then rm -f "$askpass"; return 1; fi
    git -C "$DEPLOY_PATH" reset --hard FETCH_HEAD
    git -C "$DEPLOY_PATH" remote set-url origin "$REPO_URL"
  else
    if ! GITHUB_TOKEN="${GITHUB_TOKEN:-}" GIT_ASKPASS="$askpass" GIT_TERMINAL_PROMPT=0 git clone --branch main "$REPO_URL" "$DEPLOY_PATH"; then rm -f "$askpass"; return 1; fi
  fi
  rm -f "$askpass"
  cp "$ENV_UPLOAD" "$DEPLOY_PATH/.env.production"
  chmod 600 "$DEPLOY_PATH/.env.production"
}

check_url() {
  local url="$1" output="$2" attempt
  for attempt in 1 2 3 4 5 6; do
    if curl --fail --silent --show-error --location --max-time 10 "$url" -o "$output"; then return 0; fi
    sleep 2
  done
  deployment_error "Health check failed: $url"
}

if [[ "$ACTION" == deploy ]]; then
  refresh_repository
  cd "$DEPLOY_PATH"
  if [[ "$BACKEND" == deploy ]]; then compose config --quiet; fi
  mkdir -p "$build_dir"
  for target in ${FRONTENDS[@]+"${FRONTENDS[@]}"}; do
    echo "Building $target"
    (
      cd "$DEPLOY_PATH/$target-client"
      check_client_env_files "$PWD"
      export_client_settings "$target"
      export BUILD_PATH="$build_dir/$target"
      npm ci --no-audit --no-fund
      npm run build
    )
    [[ -s "$build_dir/$target/index.html" ]] || { deployment_error "Missing $target build index"; exit 1; }
  done
  # Frontend installation/build failures occur before any running service changes.
  if [[ "$BACKEND" == deploy ]]; then
    compose build netzero-server netzero-chat-server
    compose up -d --no-build --no-deps netzero-server netzero-chat-server
    check_url "http://127.0.0.1:$PORT/health" "$build_dir/api-health"
    check_url "http://127.0.0.1:$CHAT_PORT/health" "$build_dir/chat-health"
  fi
  if [[ ${#FRONTENDS[@]} -gt 0 ]]; then
    remote_sudo mkdir -p "$stage_dir" "$backup_dir"
    for target in ${FRONTENDS[@]+"${FRONTENDS[@]}"}; do
      remote_sudo cp -R -- "$build_dir/$target" "$stage_dir/$target"
    done
    for target in ${FRONTENDS[@]+"${FRONTENDS[@]}"}; do
      if [[ -e "$WEB_ROOT/$target" ]]; then remote_sudo mv -- "$WEB_ROOT/$target" "$backup_dir/$target"; fi
      changed+=("$target")
      remote_sudo mv -- "$stage_dir/$target" "$WEB_ROOT/$target"
    done
    for target in ${FRONTENDS[@]+"${FRONTENDS[@]}"}; do
      check_url "${PUBLIC_SITE_URL%/}/$target/?release=$release_id" "$build_dir/$target-response"
      cmp -s "$build_dir/$target/index.html" "$build_dir/$target-response" || { deployment_error "Published /$target/ does not match the new build"; exit 1; }
    done
    echo "Previous frontend builds retained at $backup_dir"
  fi
  echo "Deployment complete: frontend=$FRONTEND backend=$BACKEND"
else
  [[ -d "$DEPLOY_PATH/.git" && -f "$DEPLOY_PATH/.env.production" ]] || { deployment_error 'Deploy first to create the shared checkout'; exit 1; }
  cd "$DEPLOY_PATH"
  case "$ACTION" in
    start) compose up -d --no-build --no-deps netzero-server netzero-chat-server ;;
    stop) compose stop netzero-server netzero-chat-server ;;
    restart) compose restart netzero-server netzero-chat-server ;;
    logs) compose logs -f --tail=100 netzero-server netzero-chat-server ;;
    status) compose ps ;;
  esac
fi
