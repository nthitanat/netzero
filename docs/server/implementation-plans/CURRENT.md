# NetZero server implementation plans

**Updated:** 2026-10-01 Asia/Bangkok

- [Public frontend permissions](2026-10-01-deployment-public-permissions.md): complete; the 403 permission fix passed the deployment suite and a live frontend-only rollout.
- [Production image table recovery](2026-09-30-production-image-table-recovery.md): complete; two missing image tables created from the canonical seed, existing parent schemas unchanged, affected API routes verified.
- [Client/server docs layout](2026-09-30-client-server-doc-layout.md): complete; server owns the canonical cross-stack migration record.

- [Retire repository architecture skill](2026-09-30-retire-general-architecture-skill.md): complete; the docs guide is NetZero's architecture authority.

- [Glocal monorepo migration](2026-09-30-glocal-monorepo-migration.md): local migration and fresh-checkout verification complete; production rollout pending.

- [Architecture guide relocation and plan workflow](2026-09-28-architecture-guide-and-plan-workflow.md): completed. The guide and existing database plan moved; active references were checked.
- [Database seeding workflow](database-seeding-plan.md): partly implemented. Development restart/reset verification and live synchronization remain pending; see [architecture status](../architecture-logs/CURRENT.md).
- [Docker deployment guide refresh](2026-09-28-docker-deployment-guide-refresh.md): completed. The existing guide now matches the split stacks, remote script, and backup workflow; static and Compose checks passed.
- [Architecture and deployment guide ownership](2026-09-28-architecture-deployment-guide-ownership.md): completed. The general guide owns architecture and data rules; the Docker guide owns deployment procedures.

For server implementation tasks, resume a relevant plan or create a task-specific plan here before code changes. Keep steps and status current. Cross-stack plans have one primary owner, with links from the client index when client work is affected. Tested outcomes belong in `docs/server/architecture-logs/`.
