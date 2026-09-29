#!/usr/bin/env bash
# Run on the on-premises host after configuring NETZERO_BACKUP_DIR in .env.production.
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$PROJECT_ROOT/.env.production"
: "${NETZERO_BACKUP_DIR:?Set NETZERO_BACKUP_DIR to a separate mounted disk or NAS}"
[[ "$SCRIPT_DIR" =~ ^/[A-Za-z0-9_./-]+$ ]] || { echo 'Script path contains unsupported cron characters' >&2; exit 1; }
[[ "$NETZERO_BACKUP_DIR" =~ ^/[A-Za-z0-9_./-]+$ ]] || { echo 'Backup path contains unsupported cron characters' >&2; exit 1; }
command -v crontab >/dev/null || { echo 'crontab is required on the host' >&2; exit 1; }

# Confirm that both parts of the backup can be made and restored before scheduling.
"$SCRIPT_DIR/backup-onprem.sh" backup
"$SCRIPT_DIR/backup-onprem.sh" verify
touch "$NETZERO_BACKUP_DIR/netzero-backup.log"
chmod 600 "$NETZERO_BACKUP_DIR/netzero-backup.log"

work="$(mktemp)"
trap 'rm -f "$work"' EXIT
existing="$(crontab -l 2>/dev/null || true)"
printf '%s\n' "$existing" | awk '!/# netzero-image-backup$/ && !/# netzero-restore-check$/' > "$work"
printf '0 2 * * * /bin/bash %s/backup-onprem.sh backup >> %s/netzero-backup.log 2>&1 # netzero-image-backup\n' "$SCRIPT_DIR" "$NETZERO_BACKUP_DIR" >> "$work"
printf '0 4 1 * * /bin/bash %s/backup-onprem.sh verify >> %s/netzero-backup.log 2>&1 # netzero-restore-check\n' "$SCRIPT_DIR" "$NETZERO_BACKUP_DIR" >> "$work"
crontab "$work"
echo 'Daily 02:00 backup and monthly 04:00 restore check installed in the current user crontab.'
