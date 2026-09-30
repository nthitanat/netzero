# Canonical database seeds

**Date:** 2026-09-25 Asia/Bangkok
**Status:** Rule recorded; reset, synchronization, and SQL cleanup are proposals only.

## Rule

Build a new canonical `CREATE` script for fresh schema creation and a new `INSERT` script for preset rows in a separate SQL location. Leave the current SQL and migration files unchanged during the transition. After the new workflow is implemented and verified, update those new scripts for future schema and preset changes instead of creating one-off `ALTER` or `UPDATE` files as permanent sources. Keep production reference rows distinct from development sample data. For the proposed development MySQL container, seed only when its named database volume is new and empty; removing and recreating that volume triggers seeding again. `-v` refers to Docker Compose volume removal, not a NetZero script flag. See `docs/database-seeding-plan.md` for the proposed workflow.

## Rationale and source

The user requested a clean creation and insert seed workflow instead of accumulating stale update scripts, then clarified that it must be a new workflow rather than edits to the current SQL files. Review of the current SQL folders found mixed create/insert scripts, one-off alterations and updates, and an image-metadata migration that has not yet reached production.

## Validation and transition

Documentation and skill rule only. No SQL files, deploy scripts, databases, or containers changed. The existing reviewed migration path remains necessary until reset and live synchronization tooling is designed, tested, and rolled out. Keep the pending image-metadata migration available for its production rollout.
