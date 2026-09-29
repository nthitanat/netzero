# Per-table database seed files

**Date:** 2026-09-25 Asia/Bangkok  
**Status:** Implemented and replayed in disposable MySQL 8.0.

## Objective

Split the canonical shared-database seed into a separate CREATE and INSERT file for each table, including the development image fixture inserts.

## Changed paths and decisions

- `netzero-server/sql/seed/create/`: 17 numbered single-table CREATE files, ordered so foreign-key parents precede dependent tables.
- `netzero-server/sql/seed/insert/`: 17 matching table-specific preset files. The product assessment question file holds the 28 current operator-managed presets; other files are comment-only until that table has approved presets.
- `netzero-server/sql/seed/dev/insert/`: five table-specific development fixture files for a disabled owner, product 1, event 1, and their three matching image metadata rows. The combined seed and fixture files were replaced.
- `netzero-server/sql/seed/README.md`, `docs/database-seeding-plan.md`: explain the ordered replay and per-table ownership. Historical SQL and the pending live image migration remain intact.

## Verification

- A static check found 17 matching CREATE/INSERT filename pairs, exactly one CREATE TABLE per CREATE file, INSERT statements only for the corresponding table, and five table-specific development fixture files.
- Ordered replay of all three file groups in a disposable MySQL 8.0 container yielded 17 tables, 28 question rows, one product image, two event images, valid parent joins, and product 1 gallery counter 1. The container was removed.
- `git diff --check` passed. No existing database was mutated.

## Remaining work

- The development fixture's three PNG files are local and ignored by Git; copy them to the documented paths if replaying elsewhere.
- Development volume initialization, targeted volume reset, live synchronization, and explicit production reset remain separate, unimplemented work. Production image migration remains pending its verified backup and staged rollout.
