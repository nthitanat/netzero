# Architecture skill update discipline

**Status:** Complete. User approved the previously discussed recommendation.

## Result

Replaced Maintenance wording with recurring in-place edit, consistency, efficiency/loading, validation, and dual-home release requirements. Moved history to `skills/general-architecture/logs/CHANGES.md`; that file owns what changed, why, measured counts, and skill-review evidence. Added the standard-library `release.py measure --baseline` command and three focused measurement tests alongside seven existing distribution tests.

Entry remains 402 body words; Maintenance changed from 674 to 673. Total instruction words changed from 2,338 to 2,337; the separate 380-word history is excluded from routine instruction loading. Target status is reported by the tool, while exceptions and semantic consistency require the documented review. No claim of automatic semantic enforcement.

## Validation and installation

- Skill validator passed. All ten isolated measurement/distribution tests passed, including metadata/history separation, added/deleted reference counts, bad-baseline rejection, complete installs, corruption/partial recovery, update/pins, and rollback.
- Direct links/anchors passed; entry, Adoption, and technical guidance are byte-identical to the previous release.
- Small styling task, same-session follow-up, and affected update route were manually reviewed. These were bounded read-selection simulations, not fresh-agent or application integration tests; detailed counts and limits are in the package change log.
- Complete manifests verified in both `~/.codex` and `~/.codex-office` for new revision `40f51bf5e8e34fc84b3876cdf27ae3e1a672a77f3e52a605d06c0624970a7b03`. Old revision `41718116f9e149a90a93dce8e6ac5d435f24b0d2eed79ba39a2f23ef8c5e600d` remains available and verified for rollback.
- Existing discovery links were preserved for other consumers. NetZero `AGENTS.md` directly resolves the new immutable package so its small tasks do not incur an avoidable discovery-mismatch Maintenance read.

Updated only package tooling/guidance, its tests, NetZero adoption, and required plan/log indexes. No application, database, deployment, or unrelated existing changes. No Git commit or remote publication.
