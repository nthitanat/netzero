# Docker environments

For the full deployment workflow and operator checks, use [the Docker and deployment guide](docs/DOCKER-AND-DEPLOYMENT-GUIDE.md). This file is a short command reference.

The two stacks use separate Compose files and separate environment files. The application reads unprefixed variables (`DB_HOST`, `JWT_SECRET`, `REACT_APP_API_BASE_URL`, and so on). The old combined `.env` and service-local `.env` files are no longer used.

| Environment | Compose file | Configuration file | Services |
| --- | --- | --- | --- |
| Development | `docker-compose.dev.yml` | `.env.development` | MySQL, API, chat API, selected React clients |
| Production | `docker-compose.prod.yml` | `.env.production` | API and chat API; the existing host web server serves the React build |

The real environment files are ignored by Git and have local file mode `600`. The `.example` files contain placeholders and can be committed. Copy an example when setting up a new machine, then fill in its credentials. Keep `NODE_ENV=development` in the development file and `NODE_ENV=production` in the production file. The client reads its API URLs and production static asset base from `REACT_APP_*` variables in that environment's file.

## Development

```sh
cp .env.development.example .env.development # only on a new checkout
# Edit .env.development with development database credentials and JWT secret.
docker compose --env-file .env.development -f docker-compose.dev.yml --profile both up -d --build
docker compose --env-file .env.development -f docker-compose.dev.yml --profile both logs -f
docker compose --env-file .env.development -f docker-compose.dev.yml --profile "*" down
```

`scripts/start.sh [netzero|glocal|both|none]` defaults to both clients; `scripts/stop.sh` stops all development profiles. Native clients use `scripts/client-command.sh <development|production> <netzero|glocal> <start|build>`. NetZero is at `http://localhost:3000`, Glocal at `http://localhost:3002/glocal/`, the API at `http://localhost:3001`, and chat at `http://localhost:3004`. The APIs run `nodemon` with polling; the client runs the React development server with polling. Source code is mounted into all four application containers, and named volumes hold their installed dependencies. Development MySQL 8.0 runs as `netzero-db` inside this stack; both API database hosts must be `netzero-db`, and their user, password, and database name must match. Set a separate `MYSQL_ROOT_PASSWORD` in `.env.development`. MySQL has no host port mapping, so use `docker compose --env-file .env.development -f docker-compose.dev.yml exec netzero-db mysql -u netzeroadmin -p netzero` to inspect it from the container.

The `netzero-dev-mysql-data` named volume stores MySQL data. On its first creation, MySQL runs `scripts/init-dev-database.sh`, which applies every file in `netzero-server/sql/seed/create/`, then every file in `netzero-server/sql/seed/insert/`, then `dev/insert/01-users.sql`. The last file creates active example admin, user, and community head accounts; their email addresses and shared example password are in [the seed README](netzero-server/sql/seed/README.md). Restarting or rebuilding with the same volume keeps existing data and does not replay seed files. To add the example accounts to an existing development volume without resetting it, run:

```sh
docker compose --env-file .env.development -f docker-compose.dev.yml exec -T netzero-db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" "$MYSQL_DATABASE"' < netzero-server/sql/seed/dev/insert/01-users.sql
```

The optional other `dev/insert/` files are not loaded automatically; see the seed README before adding them, since their image metadata depends on local files.

To discard only the development database and seed a fresh one, run `scripts/reset-dev-database.sh`, type the displayed volume name, then run `scripts/start.sh`. The reset stops the development stack and removes only `netzero-dev-mysql-data`. Do not use `docker compose down -v` for this purpose: it removes the application dependency volumes too. Resetting discards all changes made to the development database since its first initialization.

If a dependency changes, rebuild the corresponding image and recreate that service's `node_modules` volume. A named volume keeps its previous contents after an image rebuild.

## Production

```sh
cp .env.production.example .env.production # only on a new host
# Fill in backend credentials and CHAT_VECTOR_STORE_ID before starting the APIs.
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Production images install only API runtime dependencies and do not mount source code. The API upload directory remains a bind mount. The production Compose project keeps the existing `netzero-deploy` project name so it can recreate its current API containers. `scripts/remote-deploy.sh` uploads `.env.production`, builds the selected NetZero/Glocal clients using the shared root public values, installs that build in the existing host web root, and runs the production Compose stack for the APIs.

The production environment file also contains remote deployment and VPN credentials for the deployment scripts. Compose passes only explicitly listed application variables to the containers, so those deployment credentials are not injected into the APIs. React's `REACT_APP_*` values are embedded in its public build; never place secrets in them.

`scripts/remote-deploy.sh` uses `SUDO_PASSWORD` for local sudo when connecting the VPN or installing SSH tools. It uses `REMOTE_SUDO_PASSWORD` for sudo on the server. If the server uses the same password for SSH and sudo, leave `REMOTE_SUDO_PASSWORD` empty and the script uses `REMOTE_PASSWORD`. The uploaded configuration excludes local VPN and sudo credentials.

`CHAT_VECTOR_STORE_ID` had no value in the previous configuration. Add the production vector store ID to `.env.production` before deploying. Development can start without one, but vector-store-backed chat features need it.

## On-premises image and database backups

The API images live in `netzero-server/files` on the host. Set `NETZERO_BACKUP_DIR` in `.env.production` to an existing directory on a **separate mounted disk or NAS**. The backup script refuses a destination on the same filesystem by default. Install the host's `mysqldump`, `mysql`, `tar`, `openssl`, and Docker commands; `NETZERO_BACKUP_DB_HOST` can override the database hostname for commands running on the host (`host.docker.internal` defaults to `127.0.0.1`).

After deploying the scripts to the on-premises host, run `scripts/install-backup-cron.sh` there as the account that owns the deployment. It makes one backup, restores it in a disposable MySQL 8.0 container, and only then installs a daily 02:00 backup and a monthly 04:00 restore check. The backup contains `database.sql`, `files.tar.gz`, and `SHA256SUMS`; completed backups and `netzero-backup.log` stay in `NETZERO_BACKUP_DIR`. Check the log and disk capacity regularly. Set `NETZERO_RESTORE_IMAGE` if the isolated test needs a different MySQL image compatible with the deployed database. Backups are retained until an operator removes them.

For an additional manual check, run `scripts/backup-onprem.sh verify` on the host. This restores into a temporary container and directory, then removes them; it does not write to the live database or image directory.
