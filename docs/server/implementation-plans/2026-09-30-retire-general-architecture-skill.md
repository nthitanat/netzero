# Retire repository architecture skill

**Status:** Complete, 2026-09-30 Asia/Bangkok. See [result](../architecture-logs/code-changes/2026-09-30-retire-general-architecture-skill.md).

## Scope

Use `docs/GENERAL_ARCHITECTURE.md` as NetZero's architecture guide. Remove the repository-owned `skills/general-architecture/` package and its dedicated release test. Update live instructions and package-only configuration. Preserve historical records, installed skill distributions outside this repository, and unrelated working changes.

## Steps

1. Remove active skill routing from `AGENTS.md` and the guide's ownership note.
2. Remove the package, dedicated test, and `.gitignore` exception.
3. Check live references and Git status; record the outcome and the project rule change.

All steps complete. Historical skill plans and logs remain as records of earlier decisions.
