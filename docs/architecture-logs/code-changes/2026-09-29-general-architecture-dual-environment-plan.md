# General architecture skill installation in both Codex homes

**Status:** Completed plan clarification; skill extraction remains proposed.
**Date:** 2026-09-29 Asia/Bangkok
**Objective:** Require the future `general-architecture` skill to be created and updated in both local Codex environments.

## Changes and decisions

- Updated the extraction plan to install the same selected release from one version-controlled source in `~/.codex/skills/general-architecture/` and `~/.codex-office/skills/general-architecture/`.
- Required creation, updates, and rollback procedures to cover both homes and verify matching revision and complete skill contents. A partial installation must be repaired before the update is called complete.
- Preserved per-project adoption and revision-specific installation where projects need different releases; changing the shared source alone does not silently upgrade a project's adopted rules.
- Updated the implementation-plan and architecture-log indexes. No installed skill, application code, deployment workflow, or active `AGENTS.md` routing changed.

## Verification

- Confirmed that both Codex homes and their `skills/` directories exist. The proposed `general-architecture` skill is not yet installed in either home.
- Checked the plan's intended result, distribution section, implementation steps, and acceptance criteria for the same two-home requirement.

## Remaining work

Carry out the extraction plan, establish the version-controlled source and repeatable two-home installation procedure, create and validate the skill, then verify NetZero rule parity before switching its entry point.
