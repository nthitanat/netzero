# General architecture fixed document layout release

**Date:** 2026-09-29 Asia/Bangkok

**Outcome:** Shared release completed; no NetZero Markdown migration or project-pin update in this task.

Updated `skills/general-architecture/SKILL.md`, its Adoption and Maintenance references, separate change history, and release manifest. The previous optional records fallback is replaced with fixed locations and an adoption-time migration requirement. Technical architecture guidance and release tooling are unchanged.

Released `fe675a8657c8c24f6a19231214de7dd0cf60bea73b0cdf7f15d63612620bf525`. `release.py verify` passed for the source and both installed homes; both default links resolve to this revision. All 13 isolated release tests passed. Ruby parsed the frontmatter, relative Markdown targets existed, and `git diff --check` passed. The Python skill validator was unavailable because PyYAML is missing, so its result is unverified. Read-selection checks were manual simulations, not independent agent tests; details and before/after word counts are in the package's `logs/CHANGES.md`.

The new policy applies when projects adopt this release. Existing pinned projects need their own adoption and documentation inventory. NetZero still points at revision `1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf`, with its existing folder rules in `AGENTS.md`.

## Standalone guideline clarification

The user clarified that the shared skill should own a copied folder standard independently. Release `da723d59afccde9991da12a009e1c347b2b85cb5a078438567e5805de2c577d7` replaces the Records path paragraph with an explicit tree rooted in each project and states that no reference project or checkout is required. Both homes and default links verified after installation. All 13 isolated release tests passed; Ruby validated frontmatter. A focused check confirmed that active instructions contain no NetZero references and every local reference target stays inside the package. The earlier Python validator dependency limitation remains. No NetZero documents were moved.
