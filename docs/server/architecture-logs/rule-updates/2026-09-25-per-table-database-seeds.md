# Per-table canonical database seeds

**Date:** 2026-09-25 Asia/Bangkok  
**Status:** Approved by the user and applied to the NetZero architecture skill and guide.

## Rule

Keep one matching CREATE and INSERT file for every table in the canonical shared-database seed. A table without approved operator-managed presets gets a comment-only INSERT file. Order CREATE files by foreign-key dependencies and apply all CREATE files before the INSERT files. Keep development sample records and their image metadata in separate table-specific fixture INSERT files.

## Rationale and source

The user asked to replace the combined CREATE and INSERT scripts with separate files for each table after reviewing the initial canonical seed. Table-specific files make the owning schema and preset data explicit while preserving the production/development split.

## Validation

Updated the `Database seeds` section of `/Users/thitanatnasongkhla/.codex/skills/netzero-architecture/SKILL.md` and the corresponding section of `netzero-server/docs/GENERAL_ARCHITECTURE.md` as standalone, consistent instructions. Static checks confirmed 17 matching file pairs and table-scoped statements. Ordered disposable MySQL 8.0 replay passed with 17 tables, 28 presets, and three development image rows. Historical SQL and the production migration were not changed.
