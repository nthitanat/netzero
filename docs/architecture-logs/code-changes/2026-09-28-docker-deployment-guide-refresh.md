# Docker deployment guide refresh

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Completed; documentation only

## Objective

Replace the outdated combined-environment deployment instructions in the existing `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md` with the repository's current Docker and remote deployment workflow.

## Changed paths and decisions

- `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md`: rewritten in place around the separate development and production Compose files, current scripts, host-served React build, development database volume, and on-premises backup flow. Unimplemented live synchronization and production reset remain explicitly identified as plans.
- `docs/implementation-plans/2026-09-28-docker-deployment-guide-refresh.md` and `docs/implementation-plans/CURRENT.md`: final plan state.
- `docs/architecture-logs/CURRENT.md`: link to this documentation result.
- The handoff's stale link to the absent image-metadata rollout runbook was replaced with an explicit missing-runbook status; the runbook must be restored or rewritten before production cutover.

No application code or deployment configuration was changed in this task. Existing unrelated working-tree changes were left intact.

## Verification

- Both Compose files passed `docker compose --env-file <matching-example> -f <matching-compose-file> config --quiet`.
- A local Markdown check found valid relative links and paired code fences in the rewritten guide; stale single-file Compose instructions were absent.
- `git diff --check` passed.

No remote deployment, database reset, backup, or live health check was run. Production backup destination, image-metadata runbook, and migration steps remain pending in the architecture handoff.
