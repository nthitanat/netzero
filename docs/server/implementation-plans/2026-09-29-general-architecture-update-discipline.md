# General architecture update discipline

**Status:** Complete. Authorized by the user after reviewing the maintenance gaps.

## Scope and sequence

1. Replace maintenance wording with a concise recurring update procedure: edit the owning instruction in place, remove duplicates/contradictions, compare wording, check small-task and affected loading paths, and preserve safeguards.
2. Move history into a separate package change log, excluded from routine guidance reads; keep the 300–500-word entry target in permanent maintenance guidance.
3. Add repeatable word measurement against a verified previous release, validate changed behavior and distribution, and record limits honestly.
4. Install/verify the new immutable release in both Codex homes and update NetZero's explicit adoption. Retain previous copies and existing discovery links for active consumers.

## Verification

Run the skill validator, focused measurement/distribution tests, direct-link checks, a styling-route regression check, and an update-route check. Record before/after counts and decisions in the separate change log and project result. No application, deployment, database, or unrelated file changes are authorized.

## Outcome

All four steps completed. [Results and adoption](../architecture-logs/code-changes/2026-09-29-general-architecture-update-discipline.md) record validation, dual-home parity, preserved discovery aliases, and loading-review limits.
