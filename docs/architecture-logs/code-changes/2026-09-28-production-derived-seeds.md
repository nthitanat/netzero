# Production-derived user and product seeds

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Implemented and tested in disposable MySQL 8.0.

## Objective

Populate the canonical and development INSERT seeds with the existing production users and products, while keeping production credentials and private user contact data out of the repository.

## Changed paths and decisions

- `netzero-server/sql/seed/insert/01-users.sql` and `03-products.sql`: 44 production user IDs and 24 product rows. Users retain IDs, roles, and timestamps, but use synthetic names and `.invalid` emails, disabled accounts, nonfunctional passwords, and null contact fields. Products retain IDs, owners, catalog fields, and timestamps.
- `netzero-server/sql/seed/dev/insert/01-users.sql` and `03-products.sql`: the same snapshot uses `INSERT IGNORE` for replay after canonical inserts. The earlier local fixture owner moved to ID 1000 so it does not collide with the snapshot; fixture product 1 references that owner.
- `netzero-server/sql/seed/README.md` and `docs/database-seeding-plan.md`: document the requested snapshot, replay order, anonymization, and the exception to the usual development-only sample-data rule.
- The production database was queried read-only over VPN and SSH. No live data or schema was changed. The product gallery counter for the one numbered legacy gallery was set above its highest existing image number.

## Verification

- Compared the generated user and product ID sets against the private export: all 44 user IDs and 24 product IDs match in both seed locations. Verified synthetic email markers, no password-hash markers, and the legacy gallery counter.
- Replayed all CREATE files, canonical INSERT files, and development INSERT files in disposable MySQL 8.0: 45 users, 25 products, 28 survey questions, one product image, two event images, and no product with a missing owner. All accounts were disabled with nonfunctional credentials.
- Replayed CREATE files plus development INSERT files alone in a second disposable database: 45 users, 25 products, and no product with a missing owner.
- `git diff --check` passed. The test container and temporary private export were removed after validation.

## Remaining work

- These files are a static snapshot. Development volume initialization, targeted reset, and synchronization remain pending.
- The image fixture still depends on local ignored PNG files. Production image metadata migration remains pending its verified backup and staged rollout.
- Replaying the canonical user seed creates disabled synthetic accounts. It does not restore working production logins; use a protected database backup for disaster recovery.
