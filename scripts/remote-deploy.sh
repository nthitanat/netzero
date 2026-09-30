#!/usr/bin/env bash
# One deployment entry point for NetZero, Glocal, and their shared APIs.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/deploy-targets.sh"
ACTION=deploy FRONTEND=none BACKEND=skip DRY_RUN=false SKIP_VPN=false CLI=false
ENV_FILE="$PROJECT_ROOT/.env.production"
usage() {
  echo 'Usage: bash scripts/remote-deploy.sh [--frontend netzero|glocal|both|none] [--backend deploy|skip] [--dry-run] [--skip-vpn]'
  echo '       [--action deploy|start|stop|restart|logs|status] [--env-file PATH]'
  echo 'With no target/action flags, the interactive menu opens.'
}
while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend|--backend|--action|--env-file)
      [[ $# -ge 2 ]] || { deployment_error "Missing value for $1"; exit 1; }
      case "$1" in
        --frontend) FRONTEND="$2"; CLI=true ;;
        --backend) BACKEND="$2"; CLI=true ;;
        --action) ACTION="$2"; CLI=true ;;
        --env-file) ENV_FILE="$2" ;;
      esac
      shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --skip-vpn) SKIP_VPN=true; shift ;;
    --help|-h) usage; exit 0 ;;
    *) deployment_error "Unknown option $1"; usage; exit 1 ;;
  esac
done
if [[ "$CLI" == false ]]; then
  echo '1) Deploy selected frontends and/or backend'
  echo '2) Backend update only'
  echo '3) Start APIs'
  echo '4) Stop APIs'
  echo '5) Restart APIs'
  echo '6) View API logs'
  echo '7) API status'
  read -r -p 'Choose [1-7]: ' choice
  case "$choice" in
    1)
      echo 'Frontend: 1) NetZero  2) Glocal  3) Both  4) None'
      read -r -p 'Choose frontend [1-4]: ' choice
      case "$choice" in 1) FRONTEND=netzero ;; 2) FRONTEND=glocal ;; 3) FRONTEND=both ;; 4) FRONTEND=none ;; *) deployment_error 'Invalid frontend choice'; exit 1 ;; esac
      read -r -p 'Deploy shared backend (main and chat APIs)? [y/N]: ' choice
      case "$choice" in y|Y|yes) BACKEND=deploy ;; n|N|no|'') BACKEND=skip ;; *) deployment_error 'Invalid backend choice'; exit 1 ;; esac ;;
    2) BACKEND=deploy ;;
    3) ACTION=start ;;
    4) ACTION=stop ;;
    5) ACTION=restart ;;
    6) ACTION=logs ;;
    7) ACTION=status ;;
    *) deployment_error 'Invalid action'; exit 1 ;;
  esac
fi
select_frontends "$FRONTEND" "$BACKEND"
case "$ACTION" in deploy|start|stop|restart|logs|status) ;; *) deployment_error 'Invalid action'; exit 1 ;; esac
if [[ "$ACTION" == deploy && "$FRONTEND" == none && "$BACKEND" == skip ]]; then
  deployment_error 'Select at least one frontend or deploy the backend'; exit 1
fi
if [[ "$DRY_RUN" == true ]]; then
  echo "Action: $ACTION; frontend: $FRONTEND; backend: $BACKEND"
  for target in ${FRONTENDS[@]+"${FRONTENDS[@]}"}; do echo "Build/publish $target-client -> /$target/"; done
  if [[ "$BACKEND" == deploy ]]; then echo 'Build/start netzero-server and netzero-chat-server'; fi
  echo 'Dry run: no connection, repository refresh, build, or publication.'
  exit 0
fi
[[ -f "$ENV_FILE" ]] || { deployment_error "Missing $ENV_FILE"; exit 1; }
source "$ENV_FILE"
if [[ "$ACTION" == deploy ]]; then validate_deploy_config "$FRONTEND" "$BACKEND"; fi
require_settings REMOTE_HOST REMOTE_USER REMOTE_PASSWORD
REMOTE_PORT="${REMOTE_PORT:-22}"
for cmd in sshpass scp ssh tar; do
  command -v "$cmd" >/dev/null || { deployment_error "Install $cmd before deployment"; exit 1; }
done
if [[ "$SKIP_VPN" == false ]] && ! pgrep -x openconnect >/dev/null; then
  NETZERO_PRODUCTION_ENV_FILE="$ENV_FILE" bash "$SCRIPT_DIR/connect-vpn.sh"
fi
upload_dir="$(mktemp -d /tmp/netzero-deploy-upload.XXXXXXXX)"
archive="$upload_dir.tar"
trap 'rm -rf "$upload_dir"; rm -f "$archive"' EXIT
chmod 700 "$upload_dir"
awk '!/^[[:space:]]*(export[[:space:]]+)?(VPN_HOST|VPN_USERNAME|VPN_PASSWORD|SUDO_PASSWORD|REMOTE_HOST|REMOTE_USER|REMOTE_PORT)=/' "$ENV_FILE" > "$upload_dir/.env.production"
chmod 600 "$upload_dir/.env.production"
cp "$SCRIPT_DIR/deploy-on-host.sh" "$SCRIPT_DIR/deploy-targets.sh" "$upload_dir/"
tar -cf "$archive" -C "$upload_dir" .
chmod 600 "$archive"
remote_archive="/tmp/$(basename "$archive")"
ssh_options=(-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o PreferredAuthentications=password -o PubkeyAuthentication=no)
SSHPASS="$REMOTE_PASSWORD" sshpass -e scp -p -P "$REMOTE_PORT" "${ssh_options[@]}" "$archive" "$REMOTE_USER@$REMOTE_HOST:$remote_archive"
printf -v remote_command 'bash -s -- %q %q %q %q' "$remote_archive" "$ACTION" "$FRONTEND" "$BACKEND"
SSHPASS="$REMOTE_PASSWORD" sshpass -e ssh -p "$REMOTE_PORT" "${ssh_options[@]}" "$REMOTE_USER@$REMOTE_HOST" "$remote_command" <<'ENDSSH'
set -euo pipefail
umask 077
archive="$1" action="$2" frontend="$3" backend="$4"
upload_dir="${archive%.tar}"
trap 'rm -rf "$upload_dir"; rm -f "$archive"' EXIT
mkdir -m 700 "$upload_dir"
tar -xf "$archive" -C "$upload_dir"
bash "$upload_dir/deploy-on-host.sh" "$action" "$frontend" "$backend" "$upload_dir/.env.production"
ENDSSH
