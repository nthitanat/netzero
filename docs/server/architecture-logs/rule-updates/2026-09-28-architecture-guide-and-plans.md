# Top-level architecture guide and implementation plans

**Date:** 2026-09-28 Asia/Bangkok  
**Source:** User-requested NetZero documentation layout and skill workflow update.

## Rule

The architecture guide lives directly at `docs/GENERAL_ARCHITECTURE.md` as the exception to the subfolder rule. For implementation work using `netzero-architecture`, resume or create a task-specific plan in `docs/implementation-plans/` before code changes, update it as work progresses, and keep `docs/implementation-plans/CURRENT.md` current. Architecture change records remain in `docs/architecture-logs/`. Create other new workflow Markdown files only in those two subfolders.

## Rationale

The guide remains accessible when lower-level server documentation is removed. Plans and outcomes have predictable, resumable locations.

## Validation

The guide and existing database seeding plan were moved without replacing their contents. Active references in the skill, `AGENTS.md`, guide, seed README, and architecture index were updated. A path and link check passed, `git diff --check` passed, and Ruby YAML parsing validated the skill frontmatter. The skill creator's Python validator could not run because PyYAML is unavailable in the local Python environment. Historical logs retain their original path wording.
