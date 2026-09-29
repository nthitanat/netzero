# Canonical `netzero` seed

For each of the 17 shared database tables, `create/` contains one `CREATE TABLE` file and `insert/` contains one table-specific preset file with the same numbered filename. A table without operator-managed presets has an INSERT file containing only a comment. Numeric prefixes give the foreign-key-safe creation order.

Use these files only for a newly created, empty MySQL 8.0 database. From this directory, replay all CREATE files first, then all production preset INSERT files:

```sh
for file in create/*.sql; do mysql netzero < "$file"; done
for file in insert/*.sql; do mysql netzero < "$file"; done
```

`insert/05-products_survey_question.sql` contains the 28 current product assessment questions. At the user's request, `insert/01-users.sql` and `insert/03-products.sql` contain a 2026-09-28 production-derived snapshot of 44 users and 24 products. User IDs, product IDs, ownership, roles, and product fields are preserved. User emails and names are synthetic, passwords cannot authenticate, personal contact fields are null, and accounts are disabled. The one product with a legacy numbered gallery starts its next gallery number after the highest number seen on disk. This is a static snapshot, not live synchronization. Edit the matching CREATE file for a future schema change and the matching INSERT file for a preset change. Historical SQL and the pending migration remain in place; these seed files do not migrate a live database.

## Development fixtures

`dev/insert/` holds table-specific development INSERT files. The user and product files repeat the anonymized snapshot with `INSERT IGNORE`, so the documented canonical-then-development replay does not duplicate IDs. They also add a separate disabled fixture owner (ID 1000), three active example accounts, and local product 1. The development files can be replayed on their own after the CREATE files. After the canonical files, replay them in numeric order on an empty development database:

```sh
for file in dev/insert/*.sql; do mysql netzero < "$file"; done
```

The fixture inserts local product 1 and event 1, a disabled placeholder owner, and metadata for three image files whose parent IDs exist in the current database. It excludes four local image files whose product IDs have no current database row. The three PNG files are in `netzero-server/files/` on this machine and are ignored by Git. Copy them to the same relative paths, preferably preserving modification times, before using this fixture elsewhere; otherwise the metadata will refer to missing files.

The development accounts use the same example password, `DevOnly123!`:

| Role | Email |
| --- | --- |
| Admin | `dev-admin@example.com` |
| User | `dev-user@example.com` |
| Community head | `dev-community-head@example.com` |

These accounts are only in `dev/insert/01-users.sql`; the stored passwords are bcrypt hashes. The fixture and anonymized snapshot contain no real account credentials or private user contact details. The local product 1 and event 1 remain development-only test content.

The development Compose MySQL service initializes the canonical CREATE and INSERT files and then `dev/insert/01-users.sql` only when its named volume is new and empty. It does not automatically load the other `dev/insert/` files. For an existing development volume, apply only `dev/insert/01-users.sql` manually or reset the development database if its current data can be discarded. `scripts/reset-dev-database.sh` removes only the development database volume after confirmation; the next `scripts/start.sh` seeds it again. See `DOCKER.md` for the procedure. Live schema synchronization and explicit production reset described in `docs/implementation-plans/database-seeding-plan.md` are still pending. These seed files do not change an existing database volume or a live production database.
