# Canonical database scripts and current image fixture

**Date:** 2026-09-25 Asia/Bangkok  
**Status:** SQL implementation and disposable MySQL replay complete; development volume wiring and live rollout remain pending.

## Objective

Create clean, ordered schema and preset INSERT scripts for the shared `netzero` database, and include the current matching image metadata with its parent records in a development INSERT fixture.

## Changed paths and decisions

- `netzero-server/sql/seed/01-create.sql`: complete fresh schema from the effective 14-table development database, plus `glocal_checkins`, `product_images`, `event_images`, and `products.next_gallery_image_number`. It contains no permanent `ALTER` or `UPDATE` steps.
- `netzero-server/sql/seed/02-insert.sql`: 28 current operator-managed product assessment questions, preserving their stable question IDs and existing UUIDs. No accounts or product listings are in the production preset file.
- `netzero-server/sql/seed/dev/01-current-images.sql`: product 1, event 1, a disabled placeholder owner, and metadata for their three existing PNG files. The other four local image files have no matching product row in the current database and were excluded. No real account credentials or private contact fields were copied.
- `netzero-server/sql/seed/README.md`, `docs/database-seeding-plan.md`: replay order, fixture file prerequisite, and remaining workflow steps. Historical SQL, including the pending image migration, remains unchanged.

## Verification

- The development and production connection configurations both reached databases without image metadata tables; there were no image rows to copy. Matching file metadata was derived from the three local PNG files after checking existing parent IDs.
- Replayed CREATE, preset INSERT, and development image INSERT scripts in a disposable MySQL 8.0 container: 17 tables, 28 question rows, one product image row, two event image rows, and valid joins to their parent rows. The product gallery counter was 1. The container was removed after verification.
- `git diff --check` passed. No live database, production migration, or existing development database was mutated.

## Remaining work

- The three fixture image files are local and ignored by Git; copy them to the documented paths when replaying this optional fixture elsewhere.
- Implement and verify the development MySQL named-volume initializer, targeted database-volume reset, live schema synchronization, and explicit production reset as separate work. Production image migration and backfill still follow `docs/image-metadata-rollout.md` after a verified backup.
