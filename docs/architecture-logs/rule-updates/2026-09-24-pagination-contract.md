# Pagination contract and architecture skill

**Status:** Complete on 2026-09-24.

## Rule and reason

- Added rule 10, **Pagination contract**, to `netzero-server/docs/GENERAL_ARCHITECTURE.md` after the verified pagination fix and the user's request to capture it as a reusable rule.
- The rule requires bounded integer pagination input, decimal-string bindings for `LIMIT ? OFFSET ?` in this mysql2/MySQL setup, and client paging within the API maximum.
- Created the `netzero-architecture` skill with a short entry point and the same project-specific pagination check. Added `AGENTS.md` to direct future code edits to the skill.
- Added code-change and rule-update logs with `CURRENT.md` as the resume index.

## Validation

The SQL binding behavior was reproduced against the configured MySQL 8.0.43 database, and the affected HTTP endpoints returned 200 after the fix. The skill was validated with `quick_validate.py`.
