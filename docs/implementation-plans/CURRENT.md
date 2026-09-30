# NetZero implementation plans

**Updated:** 2026-09-30 Asia/Bangkok

- [Glocal monorepo migration](2026-09-30-glocal-monorepo-migration.md): local migration and fresh-checkout verification complete; production rollout pending.

- [General architecture fixed documentation layout](2026-09-29-general-architecture-fixed-doc-layout.md): complete; shared release installed in both homes, with existing NetZero pin retained.

- [Architecture guide relocation and plan workflow](2026-09-28-architecture-guide-and-plan-workflow.md): completed. The guide and existing database plan moved; active references and the skill format were checked.
- [Database seeding workflow](database-seeding-plan.md): partly implemented. Development restart/reset verification and live synchronization remain pending; see [architecture status](../architecture-logs/CURRENT.md).
- [Docker deployment guide refresh](2026-09-28-docker-deployment-guide-refresh.md): completed. The existing guide now matches the split stacks, remote script, and backup workflow; static and Compose checks passed.
- [Architecture and deployment guide ownership](2026-09-28-architecture-deployment-guide-ownership.md): completed. The skill routes deployment work to the Docker guide; the general guide retains architecture and data rules.
- [General architecture skill extraction](2026-09-29-general-architecture-skill.md): complete; portable package, verified dual-home installation, NetZero adoption, predecessor archive, and acceptance checks.

- [General architecture update discipline](2026-09-29-general-architecture-update-discipline.md): complete; recurring efficiency checks, separate history, measurement tooling, and verified dual-home adoption.

- [General architecture default links](2026-09-29-general-architecture-default-links.md): complete; installer advances and verifies both defaults on every update; current defaults verified.

For each implementation task in this project, resume a relevant plan or create a task-specific plan here before code changes. Keep its steps and status current, and update this index when its status changes. Plans describe intended and remaining work; tested outcomes belong in `docs/architecture-logs/`.
