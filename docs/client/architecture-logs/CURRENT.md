# NetZero client architecture handoff

**Updated:** 2026-09-30 Asia/Bangkok

- Glocal course entry point: NetZero client `/courses` route and navigation bridge added; client build passed. [Result](code-changes/2026-09-30-glocal-courses-link.md).
- Glocal monorepo migration: both React clients build locally; production rollout pending. [Canonical cross-stack result](../../server/architecture-logs/code-changes/2026-09-30-glocal-monorepo-migration.md).
- Pagination contract: client collection paging and server decimal-string bindings tested. [Canonical cross-stack result](../../server/architecture-logs/code-changes/2026-09-24-pagination-fix.md), [rule](../../server/architecture-logs/rule-updates/2026-09-24-pagination-contract.md).
- Client/server docs layout: migration complete. [Canonical cross-stack result](../../server/architecture-logs/code-changes/2026-09-30-client-server-doc-layout.md), [rule update](../../server/architecture-logs/rule-updates/2026-09-30-client-server-doc-layout.md).

Load only relevant linked records and inspect the actual client state before resuming work.
