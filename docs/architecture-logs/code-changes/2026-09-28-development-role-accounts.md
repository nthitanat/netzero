# Development role accounts

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Implemented and tested in disposable MySQL 8.0.

## Objective

Provide working development sign-in examples for the admin, user, and community_head roles.

## Changed paths and decisions

- `netzero-server/sql/seed/dev/insert/01-users.sql`: added three active, synthetic accounts with bcrypt password hashes and stable fixture IDs. The development user inserts are duplicate-safe for optional replay on an existing development database.
- `scripts/init-dev-database.sh`: applies only the development users file after canonical SQL on first initialization of an empty volume. Product and image fixtures stay optional.
- `netzero-server/sql/seed/README.md`, `DOCKER.md`, and `docs/database-seeding-plan.md`: document the example credentials, initial load, and manual insertion into an existing volume. Canonical production preset users remain disabled.

## Verification

- Checked the three fixture roles, active flags, login-validator email acceptance, and bcrypt hashes against the documented example password.
- Ran the actual first-start initializer in a disposable MySQL 8.0 container: it produced 48 users total, including one active example account for each requested role.
- Inserted the three account rows into the already-running development database without resetting it. All three accounts then signed in successfully through `POST /api/v1/auth/login` and received a token with the expected role.
- `sh -n scripts/init-dev-database.sh` and `git diff --check` passed.

## Remaining work

- Existing development volumes do not rerun first-start initialization. Apply the documented user fixture command or reset the development database when its data may be discarded.
- The separate production seed refresh still awaits VPN access; no live database was changed.
