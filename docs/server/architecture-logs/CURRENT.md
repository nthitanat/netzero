# NetZero server architecture handoff

**Updated:** 2026-10-01 Asia/Bangkok

- Frontend deploy 403: private build-file permissions were corrected in the staged public builds. Both frontends deployed successfully; public pages/assets and backend health returned 200. [Result](code-changes/2026-10-01-deployment-public-permissions.md).
- Production image table recovery: `product_images` and `event_images` were created from the canonical seed; existing parent schemas stayed unchanged and affected event/product reads returned 200. The user waived a backup for this limited operation. [Result](code-changes/2026-09-30-production-image-table-recovery.md).
- Client/server documentation split completed; root workflow folders retired. [Result](code-changes/2026-09-30-client-server-doc-layout.md), [rule update](rule-updates/2026-09-30-client-server-doc-layout.md).

- Repository architecture skill retired at the user's request; `docs/GENERAL_ARCHITECTURE.md` is now the sole NetZero architecture guide. [Result](code-changes/2026-09-30-retire-general-architecture-skill.md), [rule update](rule-updates/2026-09-30-retire-general-architecture-skill.md).

- Glocal monorepo migration: local migration and fresh-checkout verification complete; production rollout pending. [Result](code-changes/2026-09-30-glocal-monorepo-migration.md).

- Production seed refresh: blocked on VPN; requested live emails/names, events, and other populated tables remain unexported. [Checkpoint](code-changes/2026-09-28-full-production-seed-checkpoint.md).
- Development seeds: disposable-MySQL replay tested; initializer and targeted reset exist, but restart/reset verification and synchronization remain pending. Canonical users are disabled/anonymized placeholders, not production logins. [Seed result](code-changes/2026-09-28-production-derived-seeds.md), [active dev-only accounts](code-changes/2026-09-28-development-role-accounts.md), [seeding plan](../implementation-plans/database-seeding-plan.md).
- Image metadata: locally tested; production cutover blocked on verified MySQL/image backup on separate disk/NAS and restoration/rewrite of the missing rollout runbook. [Image result](code-changes/2026-09-25-image-metadata.md).
- Production backup destination: still pending. [Backup hardening](code-changes/2026-09-24-image-backup-hardening.md).
- Deployment guide refresh: completed static/Compose checks. [Result](code-changes/2026-09-28-docker-deployment-guide-refresh.md).
- Prior completed work and rule history: [archived index](2026-09-29-index-history.md); load relevant records only.

Follow repository instructions for resume and records. Existing uncommitted work may predate these logs; verify the actual files.
