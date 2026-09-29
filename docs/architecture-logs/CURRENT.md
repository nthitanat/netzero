# NetZero architecture handoff

**Updated:** 2026-09-29 Asia/Bangkok

- Shared general-architecture fixed docs layout: standalone directory standard installed and both defaults verified; each consuming project owns its documents. NetZero retains its prior pin. [Result](code-changes/2026-09-29-general-architecture-fixed-doc-layout.md), [rule update](rule-updates/2026-09-29-general-architecture-fixed-doc-layout.md).

- General architecture skill: both default links now point to the latest adopted release; future installs require default activation and verification. [Result](code-changes/2026-09-29-general-architecture-default-links.md), [rule update](rule-updates/2026-09-29-general-architecture-default-links.md), [initial extraction](code-changes/2026-09-29-general-architecture-created.md).
- Production seed refresh: blocked on VPN; requested live emails/names, events, and other populated tables remain unexported. [Checkpoint](code-changes/2026-09-28-full-production-seed-checkpoint.md).
- Development seeds: disposable-MySQL replay tested; initializer and targeted reset exist, but restart/reset verification and synchronization remain pending. Canonical users are disabled/anonymized placeholders, not production logins. [Seed result](code-changes/2026-09-28-production-derived-seeds.md), [active dev-only accounts](code-changes/2026-09-28-development-role-accounts.md), [seeding plan](../implementation-plans/database-seeding-plan.md).
- Image metadata: locally tested; production cutover blocked on verified MySQL/image backup on separate disk/NAS and restoration/rewrite of the missing rollout runbook. [Image result](code-changes/2026-09-25-image-metadata.md).
- Production backup destination: still pending. [Backup hardening](code-changes/2026-09-24-image-backup-hardening.md).
- Deployment guide refresh: completed static/Compose checks. [Result](code-changes/2026-09-28-docker-deployment-guide-refresh.md).
- Prior completed work and rule history: [archived index](2026-09-29-index-history.md); load relevant records only.

Follow repository instructions for resume and records. Existing uncommitted work may predate these logs; verify the actual files.
