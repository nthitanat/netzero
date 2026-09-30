# Shared canonical seed update rule

**Date:** 2026-09-29 Asia/Bangkok

**Authorization:** The user explicitly requested this rule in the shared `general-architecture` skill.

> Update the owning table's CREATE file for schema changes and its INSERT file for preset changes. Do not accumulate separate `ALTER` or `UPDATE` files as permanent definitions.

The rule is owned by the skill's existing Schema and seeds section. Historical migrations are retained, and live changes still require reviewed migrations and verified backups. Project paths, file naming, reset procedures, and tooling status remain project-owned.

Released as `d69cce694404d08969569e9bb462126213a5f71b19626d455d70c05bd49605b0`; source, immutable distributions, and default links verified in both Codex homes. NetZero's project adoption remains pinned independently. See the [tested outcome](../code-changes/2026-09-29-general-architecture-canonical-seeds.md) for validation and limitations.
