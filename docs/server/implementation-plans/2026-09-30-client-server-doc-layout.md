# Split architecture records by client and server

**Status:** Complete, 2026-09-30 Asia/Bangkok. See [result](../architecture-logs/code-changes/2026-09-30-client-server-doc-layout.md).

## Scope

Put architecture workflow documents beneath `docs/client/` or `docs/server/` as requested. Keep `docs/GENERAL_ARCHITECTURE.md` at the shared root. Client UI records belong to `docs/client/`; API, database, deployment, and legacy project workflow records belong to `docs/server/`. The Glocal monorepo migration and pagination contract span both sides; retain one canonical record with the server and link it from the client indexes.

## Steps

1. Inventory documents, cross-stack records, and links before moving files.
2. Move plans, outcomes, rule updates, and operator guides to the owning side; split each `CURRENT.md` index.
3. Update active repository instructions and links, including links inside moved historical records.
4. Verify local Markdown targets, old-path references in active guidance, and `git diff --check`; record the result.

All steps complete. This was a documentation migration; application source and the installed skill release were outside scope.
