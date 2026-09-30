# General architecture skill creation

**Date:** 2026-09-29 Asia/Bangkok
**Status:** Complete. Package created, dual-home installation verified, project adopted, predecessor archived, and acceptance evidence recorded.
**Release:** `41718116f9e149a90a93dce8e6ac5d435f24b0d2eed79ba39a2f23ef8c5e600d`

## Outcome and ownership

Created `skills/general-architecture/` with a 402-word entry body (438 including frontmatter), three directly linked references, a complete SHA-256 manifest, and a standard-library release helper. The source directory is portable; installed copies contain no dependency on a NetZero checkout. Source files are ready in the working tree; no Git commit or remote publication was made.

Installed matching complete releases in both configured homes; `AGENTS.md` resolves the adopted digest and records local fallback. Archived the predecessor intact outside discovery. The [parity map](2026-09-29-general-architecture-parity.md) accounts for its rules and [adoption record](../rule-updates/2026-09-29-general-architecture-adoption.md) records the authorized switch.

Updated the project guide's stale sampled implementation claims while preserving its target architecture and special contracts. Deployment guide, Compose/scripts/environment examples, application source, database contents, and unrelated pre-existing changes were not modified by this task. Compacted the architecture index and retained history plus all active safety blockers. Plan and log requirements remain project-owned.

## Verification

- Bundled `skill-creator/scripts/quick_validate.py`: passes for source and both installed homes. PyYAML was unavailable initially; installed only in `/private/tmp/general-architecture-validation-deps` to run the validator.
- Seven isolated distribution tests pass: portable/idempotent complete install; update preserves active aliases and supports two revisions/rollback; partial install fails then repairs; corruption fails without overwrite; missing/extra files fail; unavailable revision/broken alias use explicit pin; package symlink rejected. Initial test-only `/var` versus `/private/var` path comparison was corrected to compare resolved paths.
- Complete source and dual-home manifest verification, direct Markdown links/anchors, adopted project resolution in each home, and active predecessor-reference checks pass.
- Description and entry scope reviewed for Node.js/React and related deployment work, excluding unrelated stacks/writing. Automatic discovery remains enabled by default. No platform-discovery UI refresh was tested; on-disk routes and files were verified.
- [Scenario review](2026-09-29-general-architecture-scenario-review.md) records the initial shared-context simulation; fresh-context evidence and limitations are in the [loading checks](2026-09-29-general-architecture-loading.md).

Run distribution checks with `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/skills -p 'test_general_architecture_release.py' -v`.

## Limits and remaining work

No new application/CI enforcement is claimed. Existing production VPN/export, backup destination, image runbook/cutover, and development reset/restart/synchronization blockers remain in the compact index. Skill content revisions are integrity checks, not signatures. Cross-home install is recoverable rather than globally atomic. The package source is uncommitted alongside existing work; no unrelated changes were committed or reverted.
