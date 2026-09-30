# Retire repository architecture skill

**Date:** 2026-09-30 Asia/Bangkok
**Status:** Complete. [Plan](../../implementation-plans/2026-09-30-retire-general-architecture-skill.md), [rule update](../rule-updates/2026-09-30-retire-general-architecture-skill.md).

Removed `skills/general-architecture/` and its dedicated release test under `tests/skills/`. Removed the package-only `.gitignore` exception. `AGENTS.md` and `docs/GENERAL_ARCHITECTURE.md` now identify the docs guide as NetZero's architecture authority. The compact plan and architecture indexes no longer present skill installation as active project work. Historical plans and logs remain intact.

Before removal, copied the package's working contents and the dedicated test to `/private/tmp/netzero-retired-skill-e52yuisl/` because the package had uncommitted edits. Installed distributions outside this repository were not changed. No application or deployment source was changed by this task.

Verification: repository package and test are absent; docs guide exists; `rg` found no skill-package references in active instructions, guide, Git ignore rules, tests, or package manifests; `git diff --check` passed. No runtime tests were needed for this repository guidance change.
