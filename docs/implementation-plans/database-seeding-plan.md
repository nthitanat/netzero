# Database seeding workflow proposal

**Status:** Canonical SQL and an optional development image fixture are implemented. The development Compose MySQL service initializes the canonical seed on a new named volume, and a targeted volume reset script is available. Live schema synchronization and explicit production reset remain plans.

## Canonical SQL

- The shared `netzero` schema is defined in `netzero-server/sql/seed/create/`, with one numbered `CREATE TABLE` file per table. `netzero-server/sql/seed/insert/` has one matching table-specific preset file per table, including comment-only files where no preset rows exist. Apply all CREATE files in numeric order, then all INSERT files in numeric order. At the user's request, the user and product INSERT files now include a static, anonymized production-derived snapshot; see the seed README for its scope and disabled accounts. Historical SQL files remain intact. `dev/insert/` repeats that snapshot with duplicate-safe inserts and adds the local product/event image fixture. See the seed folder's README for its local image-file prerequisite.
- After the new workflow is implemented and verified, edit the owning table's `CREATE TABLE` file for schema changes and its INSERT file for preset changes. Do not leave a separate `ALTER` or `UPDATE` file as the permanent definition.
- Use preset inserts only for reviewed bulk data. The current user/product snapshot is a specific requested exception, with disabled synthetic accounts. Normal deploys do not replay inserts.
- The initial scripts use the effective shared schema, the pending image-metadata definitions, and the 28 current product assessment questions. Fresh SQL replay has passed in disposable MySQL; API-level verification remains for the development database container work. Keep the pending image-metadata migration until it has reached production.

## Explicit reset

Add `--reset-database` to the deployment workflow as a separate destructive action. It must identify the target database, require a verified backup and explicit operator confirmation, stop database writers, recreate the database, run the ordered creation scripts, run the preset inserts, and verify the result. Do not reset the database during an ordinary deploy. Account for uploaded image files and their database metadata when planning a production reset.

## Live database sync

Build a temporary database from the canonical creation scripts, compare its schema with the live database, and show a dry-run change plan. Apply reviewed safe additions; stop for ambiguous renames, drops, incompatible type changes, or changes requiring data backfill. Keep a record of the applied plan. For preset rows, use stable unique keys, insert missing rows only, and report differences in existing rows for review. Static insert text alone cannot reliably identify rows without stable keys.

## Development database volume

The development-only `netzero-db` MySQL 8.0 container uses the `netzero-dev-mysql-data` named volume. The MySQL first-start initializer applies all canonical CREATE files, all canonical INSERT files, and the development users INSERT file **only when that volume is new and empty**. This provides three active example role accounts while development product and image fixtures remain optional. Restarting containers with the existing volume keeps the data and does not run seeding again.

Here `-v` means Docker volume removal, such as `docker compose down -v`; it is **not** a new flag for a NetZero startup or deploy script. `scripts/reset-dev-database.sh` stops the development stack and removes only `netzero-dev-mysql-data` after confirmation. The next `scripts/start.sh` creates a new database volume and initializes it. `docker compose down -v` also removes the development stack's dependency volumes, so use the targeted script for a database-only reset.

## Verification before adoption

Fresh creation and inserts passed in disposable MySQL on 2026-09-25. Verify the Compose service's first-start seed, persistence across container restarts, and reseeding after targeted database-volume removal. For the workflows still to be built, test sync dry-run and missing-row insertion, blocking of unsafe schema differences, and the backup and target checks for the explicit production reset. Any later archival or removal of historical SQL files is a separate decision after the new workflow and production transition are verified.
