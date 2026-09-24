# Docker environments

The two stacks use separate Compose files and separate environment files. The application reads unprefixed variables (`DB_HOST`, `JWT_SECRET`, `REACT_APP_API_BASE_URL`, and so on). The old combined `.env` and service-local `.env` files are no longer used.

| Environment | Compose file | Configuration file | Services |
| --- | --- | --- | --- |
| Development | `docker-compose.dev.yml` | `.env.development` | API, chat API, React client |
| Production | `docker-compose.prod.yml` | `.env.production` | API and chat API; the existing host web server serves the React build |

The real environment files are ignored by Git and have local file mode `600`. The `.example` files contain placeholders and can be committed. Copy an example when setting up a new machine, then fill in its credentials. Keep `NODE_ENV=development` in the development file and `NODE_ENV=production` in the production file. The client reads its API URLs and production static asset base from `REACT_APP_*` variables in that environment's file.

## Development

```sh
cp .env.development.example .env.development # only on a new checkout
# Edit .env.development with your database credentials and JWT secret.
docker compose --env-file .env.development -f docker-compose.dev.yml up -d --build
docker compose --env-file .env.development -f docker-compose.dev.yml logs -f
docker compose --env-file .env.development -f docker-compose.dev.yml down
```

`scripts/start.sh` and `scripts/stop.sh` wrap the start and stop commands. The React client is at `http://localhost:3000`, the API at `http://localhost:3001`, and chat at `http://localhost:3004`. The APIs run `nodemon` with polling; the client runs the React development server with polling. Source code is mounted into all three containers, and named volumes hold their installed dependencies. The database remains on the host, reachable through `host.docker.internal`.

If a dependency changes, rebuild the corresponding image and recreate that service's `node_modules` volume. A named volume keeps its previous contents after an image rebuild.

## Production

```sh
cp .env.production.example .env.production # only on a new host
# Fill in every credential and CHAT_VECTOR_STORE_ID before starting.
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Production images install only API runtime dependencies and do not mount source code. The API upload directory remains a bind mount. The production Compose project keeps the existing `netzero-deploy` project name so it can recreate its current API containers. `scripts/remote-deploy.sh` uploads `.env.production`, builds the React client using its `REACT_APP_*` values, installs that build in the existing host web root, and runs the production Compose stack for the APIs.

The production environment file also contains remote deployment and VPN credentials for the deployment scripts. Compose passes only explicitly listed application variables to the containers, so those deployment credentials are not injected into the APIs. React's `REACT_APP_*` values are embedded in its public build; never place secrets in them.

`CHAT_VECTOR_STORE_ID` had no value in the previous configuration. Add the production vector store ID to `.env.production` before deploying. Development can start without one, but vector-store-backed chat features need it.
