# NetZero and Glocal

This repository contains the NetZero frontend (`netzero-client`), Glocal frontend (`glocal-client`), main API (`netzero-server`), and chat API (`netzero-chat-server`). Both clients use NetZero root configuration and remain independently deployable. Glocal catalogs remain local JSON.

Copy `.env.development.example` to `.env.development`, fill in placeholders, then run `bash scripts/start.sh` for both clients. Use `netzero`, `glocal`, or `none` as its argument to choose a frontend selection. NetZero opens at `http://localhost:3000`; Glocal at `http://localhost:3002/glocal/`.

Run `bash scripts/remote-deploy.sh` for independent frontend/backend deployment choices. Use `--frontend glocal --backend skip --dry-run` to preview a selection. Full configuration, development profiles, native commands, rollback, and checks are in [the deployment guide](docs/server/DOCKER-AND-DEPLOYMENT-GUIDE.md).

KnowledgeHub history was imported without squashing. Its frontend is now `glocal-client`; its client guides are under `docs/client/glocal/`. Retired standalone deployment scripts and sanitized local examples are preserved under `archive/glocal-deployment/`. Future application work belongs in NetZero.
