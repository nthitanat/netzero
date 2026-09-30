# General architecture extraction plan audit fixes

**Status:** Completed documentation correction; skill extraction remains proposed.
**Date:** 2026-09-29 Asia/Bangkok
**Objective:** Address the eight audit findings in the extraction proposal without implementing the future skill migration.

## Changes and decisions

- Updated `docs/implementation-plans/2026-09-29-general-architecture-skill.md`: independent shared releases; version-controlled source and per-project revision adoption; installation, mismatch, and rollback requirements; classification of code/guide differences; bounded audits and proportional records; framework-aware responsibility and caching rules; explicit transaction and external-side-effect safeguards; error boundaries for HTTP, streams, and workers; and reuse of existing authorization. Updated implementation steps and acceptance criteria together.
- Updated `docs/implementation-plans/CURRENT.md` to distinguish completed proposal corrections from pending skill creation.
- Corrected the stale error-handler description in `docs/GENERAL_ARCHITECTURE.md` section 7 and its errors/status row. Both inspected handlers use codes, names, types, and status properties rather than message-substring classification. The correction does not claim every endpoint meets the target architecture.
- Updated `docs/architecture-logs/CURRENT.md` with this documentation checkpoint; existing production migration and backup blockers remain intact.

These are proposal and factual-description changes. No application code, deployment commands, installed skills, or active `AGENTS.md` routing changed. Existing unrelated working-tree changes were preserved. No reusable rule was promoted to an installed skill.

## Verification

- Read the revised proposal end to end and checked all eight findings against its rules, implementation steps, and acceptance criteria.
- Inspected `netzero-server/src/middleware/errorHandler.js` and `netzero-chat-server/src/middleware/errorHandler.js` to ground the factual correction.
- Checked whitespace and local Markdown links in the five changed documentation files, including files currently untracked by Git; checks passed.
- No application tests or skill behavioral tests were run: this task changes documentation, and the proposed general skill does not yet exist.

## Remaining work

Implement the revised extraction steps in the plan: establish the version-controlled skill source, create and validate the skill, exercise the documented adoption scenarios, verify NetZero rule parity, and only then switch its entry point and retire the old skill. Architecture enforcement remains limited to existing checks until separately scoped CI work is implemented.
