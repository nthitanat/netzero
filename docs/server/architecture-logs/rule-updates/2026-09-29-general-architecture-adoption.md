# Adopt general architecture

**Date:** 2026-09-29 Asia/Bangkok
**Authorization:** User requested creation from `docs/implementation-plans/2026-09-29-general-architecture-skill.md`, including dual-home installation and predecessor replacement. These rules were explicitly specified; no additional rule-promotion decision is pending.

## Decision

Adopt `general-architecture` revision `41718116f9e149a90a93dce8e6ac5d435f24b0d2eed79ba39a2f23ef8c5e600d` from the repository source `skills/general-architecture/`. Installed release copies in both `~/.codex` and `~/.codex-office` are immutable distributions. Each home resolves `skills/general-architecture` to `skill-releases/general-architecture/41718116f9e149a90a93dce8e6ac5d435f24b0d2eed79ba39a2f23ef8c5e600d/`. Project-local source is a fallback only after matching the adopted digest. A new shared release does not silently change NetZero adoption.

Shared references own general principles, adoption, and release procedures. NetZero retains `/api/v1`, mysql2 decimal-string pagination, class-free target/naming exceptions, per-table seed format, image tables/URLs/IDs/switches, operational topology, migration blockers, and its required records. Concrete ownership is in the [parity map](../code-changes/2026-09-29-general-architecture-parity.md).

## Validation and recovery

Both complete installed manifests match source and the skill validator passes in both homes. Distribution tests exercise installation, updates, differing project revisions, rollback, partial-install recovery, corruption/missing/extra detection, and symlink rejection. No application or deployment changes and no new CI gates.

The predecessor is archived intact at `~/.codex/retired-skills/netzero-architecture-2026-09-29/`, including UI metadata, outside skill discovery. To undo this adoption, restore the archived directory to its former `skills/netzero-architecture` location only if vacant, restore the predecessor route from the earlier project record, and leave the general release copies available for other projects. Later general-skill revision rollback follows Maintenance and the recorded previous digest.
