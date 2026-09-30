# Archived index before general architecture adoption

Historical snapshot; current status is in [CURRENT.md](CURRENT.md). Statements below describe the pre-adoption checkpoint.

# NetZero architecture handoff

**Updated:** 2026-09-29 Asia/Bangkok
**Active implementation:** [Full production seed refresh](code-changes/2026-09-28-full-production-seed-checkpoint.md) is waiting for VPN access. The requested live email and name values, events, and other populated tables have not been exported yet. [Production-derived user and product seeds](code-changes/2026-09-28-production-derived-seeds.md) were tested in disposable MySQL; the development volume initializer and targeted reset exist, but restart/reset verification and synchronization remain pending. The canonical users are anonymized, disabled placeholders, not recoverable production logins; [development role accounts](code-changes/2026-09-28-development-role-accounts.md) are active only in the development fixture. [Indexed image metadata and nullable image links](code-changes/2026-09-25-image-metadata.md) are tested locally, but production migration awaits a verified MySQL and image-file backup on a separate disk or NAS. The referenced image-metadata rollout runbook is currently absent and must be restored or rewritten before production cutover. [Product image upload and on-premises backup hardening](code-changes/2026-09-24-image-backup-hardening.md) still needs its production backup destination.

- Latest checkpoint: [Full production seed refresh awaiting VPN](code-changes/2026-09-28-full-production-seed-checkpoint.md).
- Latest skill-plan clarification: [Install the future general skill in both Codex homes](code-changes/2026-09-29-general-architecture-dual-environment-plan.md). The plan now requires the same selected release in `~/.codex` and `~/.codex-office`; the skill remains uncreated.
- Latest documentation change: [General architecture efficiency plan](code-changes/2026-09-29-general-architecture-efficiency-plan.md). Selective loading and deduplication specified; skill extraction remains proposed.
- Previous documentation change: [General architecture plan audit fixes](code-changes/2026-09-29-general-architecture-plan-audit-fixes.md). Eight findings addressed in the proposal and a stale error-handler description corrected.
- Previous documentation change: [Docker deployment guide refresh](code-changes/2026-09-28-docker-deployment-guide-refresh.md).
- Latest completed code change: [Retired Chula survey initializer](code-changes/2026-09-28-retire-chula-survey-initializer.md).
- Previous completed code change: [Development role accounts](code-changes/2026-09-28-development-role-accounts.md).
- Previous code change: [Production-derived user and product seeds](code-changes/2026-09-28-production-derived-seeds.md).
- Previous code change: [Per-table database seed files](code-changes/2026-09-25-per-table-database-seeds.md).
- Earlier code change: [Canonical database scripts and current image fixture](code-changes/2026-09-25-canonical-database-scripts.md).
- Earlier code change: [Indexed image metadata and nullable image links](code-changes/2026-09-25-image-metadata.md).
- Earlier code change: [Product and event image links in API responses](code-changes/2026-09-24-image-response-links.md).
- Earlier code change: [Deployment sudo password automation](code-changes/2026-09-24-deploy-sudo-automation.md).
- Earlier code change: [Pagination binding and client paging](code-changes/2026-09-24-pagination-fix.md).
- Latest rule update: [Separate architecture and deployment guide ownership](rule-updates/2026-09-28-architecture-deployment-guide-ownership.md).
- Previous rule update: [Top-level architecture guide and implementation plans](rule-updates/2026-09-28-architecture-guide-and-plans.md).
- Earlier rule update: [Per-table canonical database seeds](rule-updates/2026-09-25-per-table-database-seeds.md). Every shared table has a matching CREATE and INSERT file; development fixtures are separate.
- Previous rule update: [Self-contained architecture instructions](rule-updates/2026-09-25-self-contained-architecture-instructions.md). Skill and guide sections must be rewritten in place as standalone instructions; history belongs in the logs.
- Earlier rule update: [Canonical database seeds](rule-updates/2026-09-25-canonical-database-seeds.md). Canonical SQL is now implemented; historical SQL remains unchanged. Reset and synchronization are proposed, not implemented.
- Workflow design and status: [Database seeding plan](../implementation-plans/database-seeding-plan.md). Development reseeding will occur when its Docker database volume is removed and recreated; `-v` is Docker's volume removal flag, not a NetZero script option.
- Previous rule update: [Image response and metadata reads](rule-updates/2026-09-25-image-response-metadata-reads.md).
- Earlier rule update: [Staged metadata cutovers and orphan audits](rule-updates/2026-09-25-staged-metadata-cutovers.md).
- Earlier rule update: [Pagination contract and architecture skill](rule-updates/2026-09-24-pagination-contract.md).

On resume, read the relevant linked log, inspect `git status` and the actual files, then continue from verified state. This log begins with the pagination work in this conversation; other existing uncommitted changes predate this logging system and are not described here.
