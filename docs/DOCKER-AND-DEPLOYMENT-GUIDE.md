# Docker and deployment guide

This guide owns the NetZero Docker and deployment workflow: Compose environments, deployment commands, host paths, backups, and operator checks. Keep application layer boundaries, API contracts, and database schema rules in [the general architecture guide](GENERAL_ARCHITECTURE.md). Run commands from the repository root unless a step says otherwise. The [architecture handoff](architecture-logs/CURRENT.md) records rollout work that is still pending.

## Environment layout

| Environment | Compose file | Environment file | Services |
| --- | --- | --- | --- |
| Development | `docker-compose.dev.yml` | `.env.development` | MySQL, main API, chat API, React development server |
| Production | `docker-compose.prod.yml` | `.env.production` | Main API and chat API |

Production React is built on the remote host and served by its existing web server from `/www/wwwroot/engagement.chula.ac.th/netzero`. The production Compose file has no client or MySQL service. The API containers use the existing host MySQL through `host.docker.internal` and retain uploaded images in the bind-mounted `netzero-server/files` directory.

Copy [`.env.development.example`](../.env.development.example) or [`.env.production.example`](../.env.production.example) to the matching untracked environment file on a new machine. Replace placeholders, keep the real files private, and use `NODE_ENV=development` or `NODE_ENV=production` as appropriate. The application reads unprefixed variables such as `DB_HOST` and `JWT_SECRET`. Production `REACT_APP_*` values are public build inputs; do not put secrets in them. The former combined `.env` and per-service environment files are not used by this pipeline.

## Development

Set both API database hosts to `netzero-db`. Their credentials and database name must match the MySQL service settings. Set a separate `MYSQL_ROOT_PASSWORD`.

```sh
cp .env.development.example .env.development
# Fill in the placeholders in .env.development.
bash scripts/start.sh
docker compose --env-file .env.development -f docker-compose.dev.yml logs -f
bash scripts/stop.sh
```

`scripts/start.sh` checks the environment file, builds the development images, starts the stack, and prints the local addresses. Defaults in the example are client `http://localhost:3000`, main API `http://localhost:3001/api/v1`, and chat API `http://localhost:3004/api/v1`. Source trees are bind mounted and the application services run with file polling. The MySQL container has no host port mapping; inspect it with `docker compose --env-file .env.development -f docker-compose.dev.yml exec netzero-db mysql -u netzeroadmin -p netzero`.

The named `netzero-dev-mysql-data` volume persists database contents. On a new empty volume, [`scripts/init-dev-database.sh`](../scripts/init-dev-database.sh) applies all canonical CREATE files, all canonical preset INSERT files, then the development users fixture. Rebuilding or restarting with an existing volume does not rerun the seed. Other development fixtures are optional and are not loaded automatically; image fixtures require matching local image files. See the [seed README](../netzero-server/sql/seed/README.md).

To add only the development sign-in accounts to an existing volume, use the command in [`DOCKER.md`](../DOCKER.md). To discard and reseed only the development database, run `bash scripts/reset-dev-database.sh`, type the exact volume name when prompted, then run `bash scripts/start.sh`. The reset stops the development stack and deletes the database volume. It discards changes made since first initialization. Avoid `docker compose down -v` for a database-only reset because it also removes the named application dependency volumes.

## Production preparation

Fill in `.env.production`, including database and chat credentials, `CHAT_VECTOR_STORE_ID`, remote SSH and VPN settings, and the React API and asset URLs. The remote deploy script refuses to start unless `NODE_ENV=production` and `CHAT_VECTOR_STORE_ID` are set. The production Compose file requires the variables marked with `:?` in [`docker-compose.prod.yml`](../docker-compose.prod.yml). Check the Compose configuration locally before a deployment:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
```

The production API images install runtime dependencies and do not mount source code. The main API mounts `./netzero-server/files:/app/files` for image persistence. Keep this host directory intact during deploys. Production uses the existing `netzero-deploy` Compose project and host MySQL; ordinary deploys do not create, reset, or seed the production database.

Live schema changes follow a reviewed migration with a verified backup. Canonical seed files initialize new databases; they do not synchronize a live database. The proposed synchronization and explicit production reset are still unimplemented; see the [database seeding plan](implementation-plans/database-seeding-plan.md). For image metadata rollout, leave `IMAGE_METADATA_READS_ENABLED` and `IMAGE_METADATA_UPLOADS_ENABLED` false until the backfill, audit, backup, and rollout steps have been completed.

## Remote deployment

Run `bash scripts/remote-deploy.sh` on the local machine and select an action from its menu. The script loads the local `.env.production`, connects to the VPN if needed, checks the remote host, uploads a filtered environment file over SCP, and runs one SSH session on the server. It uses `SUDO_PASSWORD` for local sudo and `REMOTE_SUDO_PASSWORD` for server sudo, falling back to `REMOTE_PASSWORD` when the latter is empty. The upload removes local VPN and local sudo keys; server SSH, sudo, repository, and application settings remain in the uploaded file. Compose explicitly maps application variables into its containers.

| Menu option | Current behavior |
| --- | --- |
| 1 Full Deploy | Clone or refresh `/www/netzero-deploy`, copy `.env.production` there, install and build React, replace the host web root's `netzero` directory, then build and start both API containers. |
| 2 API Update | Refresh the repository and environment file, then rebuild and start both API containers; it does not rebuild the React client. |
| 3 Start | Start the existing production API containers. |
| 4 Stop | Stop the production Compose stack. |
| 5 Restart | Restart the API containers without rebuilding their images. |
| 6 View logs | Follow the production Compose logs. |
| 7 Container status | Show Compose status and Docker disk usage. |

The script refreshes an existing remote checkout with `git fetch` followed by `git reset --hard origin/main`, with a pull fallback. Keep remote-only changes outside that checkout. A full deploy replaces the existing React `netzero` web-root directory. The script checks HTTP responses from the APIs and web client after options 1 and 2, but reports a failed check as a warning, so review the resulting status and logs before treating a rollout as healthy.

The script currently uses password-based SSH through `sshpass` and disables SSH host-key verification. Follow the actual script when operating this deployment; do not copy the retired single-file Compose or generic nginx examples from the previous version of this guide.

## On-premises backups

Before a production image or schema cutover, configure `NETZERO_BACKUP_DIR` in `.env.production` to an existing mounted disk or NAS on a separate filesystem from `netzero-server/files`. [`scripts/backup-onprem.sh`](../scripts/backup-onprem.sh) refuses a same-filesystem destination by default. On the on-premises host, provide `mysqldump`, `mysql`, `tar`, `openssl`, and Docker; `NETZERO_BACKUP_DB_HOST` and `NETZERO_BACKUP_DB_PORT` can override the host-side connection target.

```sh
bash scripts/backup-onprem.sh backup
bash scripts/backup-onprem.sh verify
```

A completed backup contains `database.sql`, `files.tar.gz`, and `SHA256SUMS`. Verification checks the archive and checksum, extracts files, and restores the SQL into a disposable MySQL container. It does not write to the live database or image directory. [`scripts/install-backup-cron.sh`](../scripts/install-backup-cron.sh) first runs one backup and restore check, then installs a daily 02:00 backup and monthly 04:00 restore check in the current user's crontab. Review `netzero-backup.log` and available disk space; the scripts do not prune old backups.

The architecture handoff still records the production backup destination and some production migration steps as pending. A script existing in the repository does not establish that a backup has been configured or verified on the server.

## Checks and troubleshooting

- Validate Compose input with `docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet` or its development equivalent before starting containers.
- Inspect containers with `docker compose --env-file .env.production -f docker-compose.prod.yml ps` and logs with the same prefix followed by `logs --tail=100`. The remote menu provides the same status and logs operations.
- If a changed production API does not appear, use the API Update or Full Deploy option, which passes `up -d --build`. `restart` alone uses the existing image.
- If a changed production React URL or asset base does not appear, use Full Deploy. React embeds `REACT_APP_*` values at build time; API Update does not rebuild the client.
- If a development dependency change is absent after rebuilding, inspect the service's persistent `node_modules` volume. Rebuilding an image does not replace an existing named dependency volume.
- For database reset, seed replay, and live schema migration status, use the [database seeding plan](implementation-plans/database-seeding-plan.md) and [architecture handoff](architecture-logs/CURRENT.md).

Check both Compose files, the environment examples, and the scripts in `scripts/` when updating this guide. [`DOCKER.md`](../DOCKER.md) is the short command reference; update it too when its commands change.
