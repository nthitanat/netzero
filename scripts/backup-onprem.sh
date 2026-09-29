#!/usr/bin/env bash
# Back up the on-premises MySQL database and API image directory to a separate mounted filesystem.
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${NETZERO_ENV_FILE:-$PROJECT_ROOT/.env.production}"
ACTION="${1:-backup}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file not found: $ENV_FILE" >&2
  exit 1
fi
# This is the same trusted, operator-owned environment file used by deployment.
source "$ENV_FILE"
: "${DB_USER:?DB_USER is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${DB_NAME:?DB_NAME is required}"
: "${NETZERO_BACKUP_DIR:?NETZERO_BACKUP_DIR must point to a mounted backup disk or NAS}"
[[ "$DB_NAME" =~ ^[A-Za-z0-9_]+$ ]] || { echo 'DB_NAME contains unsupported characters' >&2; exit 1; }

IMAGE_DIR="$PROJECT_ROOT/netzero-server/files"
BACKUP_DIR="$NETZERO_BACKUP_DIR"
[[ -d "$IMAGE_DIR" ]] || { echo "Image directory not found: $IMAGE_DIR" >&2; exit 1; }
[[ -d "$BACKUP_DIR" ]] || { echo "Backup directory not found: $BACKUP_DIR" >&2; exit 1; }
[[ "$BACKUP_DIR" = /* ]] || { echo 'NETZERO_BACKUP_DIR must be an absolute path' >&2; exit 1; }

filesystem_id() {
  if stat -c %d "$1" >/dev/null 2>&1; then stat -c %d "$1"; else stat -f %d "$1"; fi
}
if [[ "${NETZERO_ALLOW_LOCAL_BACKUP:-0}" != 1 ]] &&
   [[ "$(filesystem_id "$IMAGE_DIR")" == "$(filesystem_id "$BACKUP_DIR")" ]]; then
  echo 'Backup destination is on the same filesystem as the images; choose a separate disk or NAS' >&2
  exit 1
fi

command -v mysqldump >/dev/null || { echo 'mysqldump is required on the host' >&2; exit 1; }
command -v mysql >/dev/null || { echo 'mysql is required on the host' >&2; exit 1; }
command -v tar >/dev/null || { echo 'tar is required on the host' >&2; exit 1; }

DB_HOST_FOR_BACKUP="${NETZERO_BACKUP_DB_HOST:-${DB_HOST:-127.0.0.1}}"
if [[ "$DB_HOST_FOR_BACKUP" == host.docker.internal ]]; then DB_HOST_FOR_BACKUP=127.0.0.1; fi
DB_PORT_FOR_BACKUP="${NETZERO_BACKUP_DB_PORT:-${DB_PORT:-3306}}"
export MYSQL_PWD="$DB_PASSWORD"
MYSQL_ARGS=(--host="$DB_HOST_FOR_BACKUP" --port="$DB_PORT_FOR_BACKUP" --user="$DB_USER")

checksum() {
  if command -v sha256sum >/dev/null; then sha256sum "$@"; else shasum -a 256 "$@"; fi
}
check_checksum() {
  if command -v sha256sum >/dev/null; then sha256sum -c SHA256SUMS; else shasum -a 256 -c SHA256SUMS; fi
}

backup() (
  local stamp work completed
  stamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
  work="$(mktemp -d "$BACKUP_DIR/.netzero-incomplete.XXXXXX")"
  trap 'rm -rf "$work"' EXIT
  if command -v flock >/dev/null; then
    exec 9>"$BACKUP_DIR/.netzero-backup.lock"
    flock -n 9 || { echo 'Another backup is running' >&2; exit 1; }
  fi
  mysqldump "${MYSQL_ARGS[@]}" --single-transaction --quick --routines --events --triggers --no-tablespaces "$DB_NAME" > "$work/database.sql"
  [[ -s "$work/database.sql" ]] || { echo 'Database dump is empty' >&2; exit 1; }
  tar -C "$PROJECT_ROOT/netzero-server" -czf "$work/files.tar.gz" files
  (cd "$work" && checksum database.sql files.tar.gz > SHA256SUMS && check_checksum >/dev/null)
  completed="$BACKUP_DIR/$stamp"
  [[ ! -e "$completed" ]] || { echo "Backup name already exists: $completed" >&2; exit 1; }
  mv "$work" "$completed"
  echo "Backup completed: $completed"
)

verify() (
  local source_backup="$1" scratch container restore_image restore_password table_count file_count ready=0
  [[ -d "$source_backup" ]] || { echo "Backup not found: $source_backup" >&2; exit 1; }
  (cd "$source_backup" && check_checksum >/dev/null)
  command -v docker >/dev/null || { echo 'Docker is required for an isolated restore test' >&2; exit 1; }
  command -v openssl >/dev/null || { echo 'OpenSSL is required for an isolated restore test' >&2; exit 1; }
  scratch="$(mktemp -d "${TMPDIR:-/tmp}/netzero-restore.XXXXXX")"
  container="netzero-restore-$(date -u +%Y%m%d%H%M%S)-$RANDOM"
  restore_image="${NETZERO_RESTORE_IMAGE:-mysql:8.0}"
  restore_password="$(openssl rand -hex 24)"
  trap 'docker rm -f "$container" >/dev/null 2>&1 || true; rm -rf "$scratch"' EXIT
  tar -C "$scratch" -xzf "$source_backup/files.tar.gz"
  [[ -d "$scratch/files" ]] || { echo 'Image archive did not restore the files directory' >&2; exit 1; }
  file_count="$(find "$scratch/files" -type f | wc -l | tr -d ' ')"
  MYSQL_ROOT_PASSWORD="$restore_password" docker run --rm -d --name "$container" \
    -e MYSQL_ROOT_PASSWORD "$restore_image" >/dev/null
  for ((attempt = 0; attempt < 60; attempt++)); do
    if docker exec "$container" sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot -e "SELECT 1"' >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 2
  done
  [[ "$ready" == 1 ]] || { echo 'Temporary MySQL container did not become ready' >&2; exit 1; }
  docker exec "$container" sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot -e "CREATE DATABASE netzero_restore"'
  docker exec -i "$container" sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot netzero_restore' < "$source_backup/database.sql"
  table_count="$(docker exec "$container" sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --batch --skip-column-names -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''netzero_restore'\''"')"
  [[ "$table_count" =~ ^[0-9]+$ && "$table_count" -gt 0 ]] || { echo 'Restored database contains no tables' >&2; exit 1; }
  echo "Restore verified: $table_count database tables and $file_count image files extracted from $source_backup"
)

case "$ACTION" in
  backup) backup ;;
  verify)
    if [[ -n "${2:-}" ]]; then
      verify "$2"
    else
      latest="$(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '20??-??-??T??????Z' | sort | tail -n 1)"
      [[ -n "$latest" ]] || { echo 'No completed backups found' >&2; exit 1; }
      verify "$latest"
    fi
    ;;
  *) echo 'Usage: backup-onprem.sh [backup|verify [backup-directory]]' >&2; exit 1 ;;
esac
