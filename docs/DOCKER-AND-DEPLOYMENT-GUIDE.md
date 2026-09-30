# Docker and deployment guide

This guide owns Docker, shared frontend configuration, deployment selection, publication, and operator checks. [The general architecture guide](GENERAL_ARCHITECTURE.md) owns backend contracts and database boundaries. Commands run from the repository root.

## Environment layout

| Environment | Compose file | Root environment file | Services |
| --- | --- | --- | --- |
| Development | `docker-compose.dev.yml` | `.env.development` | MySQL, main API, chat API, selected React clients |
| Production | `docker-compose.prod.yml` | `.env.production` | Main API and chat API |

`netzero-client` and `glocal-client` keep separate packages, lockfiles, dependencies, and UI architecture. Both consume the root `REACT_APP_API_BASE_URL`; their service paths include `/api/v1`, so the base must exclude that suffix. Development uses `http://localhost:3001`; production uses `https://engagement.chula.ac.th/netzero-api/`. Glocal retains `/glocal` public assets and hash routing. Its catalogs remain local JSON; authentication and check-in use NetZero APIs.

Copy `.env.development.example` or `.env.production.example` to its private matching file and fill in placeholders. API/provider/database credentials remain server inputs. Only explicit public build inputs reach the frontends. Client-local `.env` files are rejected by native build/start and deployment helpers; Compose supplies public inputs directly from its selected root file. Never place secrets in `REACT_APP_*` values.

## Development

Set both API database hosts to `netzero-db` and match the MySQL user, password, and database name. Set a separate `MYSQL_ROOT_PASSWORD`.

```sh
cp .env.development.example .env.development # new checkout only
bash scripts/start.sh               # both clients
bash scripts/start.sh netzero       # NetZero and shared backend
bash scripts/start.sh glocal        # Glocal and shared backend
bash scripts/start.sh none          # shared backend only
bash scripts/stop.sh
```

The wrapper defaults to the `both` frontend profile. Direct Compose usage must specify `--profile both`, `--profile netzero`, or `--profile glocal`; without profiles, only the backend starts. Starting a selection does not stop already running clients. `scripts/stop.sh` enables all profiles to stop the complete development stack without removing volumes.

```sh
docker compose --env-file .env.development -f docker-compose.dev.yml --profile both up -d --build
docker compose --env-file .env.development -f docker-compose.dev.yml --profile both logs -f
```

Default addresses are NetZero `http://localhost:3000`, Glocal `http://localhost:3002/glocal/`, main API `http://localhost:3001/api/v1`, and chat API `http://localhost:3004/api/v1`. `GLOCAL_CLIENT_PORT` changes Glocal's port; add that browser origin to `CORS_ORIGIN` when changing it. Source mounts, polling, and separate dependency volumes support live reload.

For a native frontend, install dependencies in its own folder, then start it through the root helper:

```sh
(cd glocal-client && npm ci)
bash scripts/client-command.sh development glocal start
bash scripts/client-command.sh production glocal build
bash scripts/client-command.sh development netzero start
```

Glocal's existing CRA lockfile resolves TypeScript 6, which conflicts with CRA's optional TypeScript peer constraint. A clean install without legacy peer resolution failed. `glocal-client/.npmrc` retains `legacy-peer-deps=true`, including inside its development Docker image; `npm ci` remains reproducible without modifying the imported lockfile. NetZero keeps its existing install mode.

The development database persists in `netzero-dev-mysql-data`; first creation applies canonical CREATE/INSERT files and the development users fixture. Rebuild/restart does not replay seeds. [The seed README](../netzero-server/sql/seed/README.md) owns fixture details. `scripts/reset-dev-database.sh` discards only that development database after its exact-name prompt; avoid `down -v`, which also deletes dependency volumes. Production database and uploaded-image procedures are unchanged.

## Production preparation

Frontend-only deployment requires `NODE_ENV=production`, repository/SSH/sudo settings, and the selected frontend's public inputs. Glocal requires `REACT_APP_API_BASE_URL`; NetZero additionally requires its chat URL and tree mode. Backend deployment requires the full production Compose settings, including `OPENAI_API_KEY` and `CHAT_VECTOR_STORE_ID`. An omitted backend does not require its configuration or invoke Docker.

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet # backend configuration
bash scripts/remote-deploy.sh --frontend both --backend skip --dry-run
```

Production Compose retains `netzero-deploy`, host MySQL, and `netzero-server/files`. It contains no frontend or database service. Ordinary deployment never seeds/resets a database. Keep image-metadata flags false until the existing backfill, audit, backup, and rollout requirements pass.

## Remote deployment

`bash scripts/remote-deploy.sh` opens the menu. Option 1 asks independently for frontend (NetZero, Glocal, both, none) and backend (deploy, skip). Option 2 updates the backend only. Options 3–7 start, stop, restart, follow logs, or show API status. The same choices are available noninteractively:

```sh
bash scripts/remote-deploy.sh --frontend netzero --backend skip
bash scripts/remote-deploy.sh --frontend glocal --backend skip
bash scripts/remote-deploy.sh --frontend both --backend deploy
bash scripts/remote-deploy.sh --frontend none --backend deploy
bash scripts/remote-deploy.sh --action status
```

Every valid frontend/backend combination works; `none` + `skip` is rejected. `--dry-run` prints selections without reading credentials, connecting, or modifying anything. `--skip-vpn` uses an already available network route. `--env-file PATH` selects a private production root file, including for the VPN helper.

The shared pipeline connects once over SSH, refreshes one NetZero repository, and installs one filtered root `.env.production`. The default checkout is `/www/netzero-deploy`; `DEPLOY_PATH` can override it. Existing checkouts fetch `main` from `REPO_URL` and reset to that revision. Keep remote-only changes outside the checkout. Uploaded images remain in their existing bind mount; deployment does not recursively change their ownership. Git credentials use a temporary askpass helper rather than a token-bearing remote URL.

| Target | Source | Default publication destination |
| --- | --- | --- |
| NetZero | `netzero-client` | `/www/wwwroot/engagement.chula.ac.th/netzero` |
| Glocal | `glocal-client` | `/www/wwwroot/engagement.chula.ac.th/glocal` |
| Backend | Existing server folders | Existing main/chat production Compose services |

All selected frontends install and build successfully before any service update or publication. Backend selection builds and starts only the main/chat services and checks their local health URLs. Selected frontend builds then stage beside the web root, move existing builds to `.netzero-releases/<release>/`, and publish. Unselected frontend directories and backend services are untouched. The host must provide `flock`; a checkout-specific lock prevents concurrent deployments.

`WEB_ROOT` overrides the static root and `PUBLIC_SITE_URL` overrides the public host. Each selected `/netzero/` or `/glocal/` URL is fetched with a release query and its HTML compared with the built index. A failed publication or URL/content check exits unsuccessfully and restores the previous selected frontends. Failed backend rollout does not automatically restore API images or data; inspect backend health/logs before retrying. Frontend build failures leave running APIs unchanged. Retained previous builds are never automatically pruned.

For a manual frontend rollback, use the path printed by deployment, take the failed current target aside, move that release's previous target back to `WEB_ROOT/<target>`, then check its public URL. Keep the other frontend directory intact. For API management, the script uses the existing remote root configuration and does not replace it with the upload.

The upload excludes local VPN and local sudo keys; remote sudo and repository/application settings remain private in a mode-600 file. The script retains the existing password SSH and host-key policy. Old Glocal scripts and sanitized examples are inert references under `archive/glocal-deployment/`; new releases must use this shared entry point. The old GitHub repository should be made read-only only after a verified live rollout and redirected to NetZero.

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
- If a changed production API does not appear, select backend deployment, which passes `up -d --build`. `restart` alone uses the existing image.
- If a changed production React URL or asset base does not appear, select the affected frontend. React embeds `REACT_APP_*` values at build time; Backend-only deployment does not rebuild either frontend.
- If a development dependency change is absent after rebuilding, inspect the service's persistent `node_modules` volume. Rebuilding an image does not replace an existing named dependency volume.
- For database reset, seed replay, and live schema migration status, use the [database seeding plan](implementation-plans/database-seeding-plan.md) and [architecture handoff](architecture-logs/CURRENT.md).

Check both Compose files, the environment examples, and the scripts in `scripts/` when updating this guide. [`DOCKER.md`](../DOCKER.md) is the short command reference; update it too when its commands change.
