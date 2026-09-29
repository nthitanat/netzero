# Product image upload and on-premises backup hardening

**Date:** 2026-09-24 Asia/Bangkok
**Status:** In progress — code and local restore tested; on-premises schedule awaits a separate backup disk or NAS path.

## Objective

Validate actual uploaded image bytes and save a matching format, return the existing public image routes after upload, and make scheduled backups of the image directory and MySQL database with an isolated restore check.

## Changed paths and layer decisions

- `netzero-server/src/adapters/productImageStorage.js`: decode and rewrite uploads with Sharp, save their detected extension and MIME type, read legacy `.png` files by their actual content, and reserve gallery IDs across image formats. Binary file operations stay in the adapter.
- `netzero-server/src/middleware/imageUpload.js`: use an extension-neutral temporary filename; upload transport stays in middleware.
- `netzero-server/src/services/ProductService.js`: map invalid image errors to API validation errors; retain ownership and failure cleanup in the service.
- `netzero-server/src/controllers/ProductController.js`: return canonical fetch URLs and actual MIME types while preserving response fields and routes.
- `netzero-server/package.json`, lock files: add Sharp 0.33.5, compatible with the production Node 18 image.
- `scripts/backup-onprem.sh`, `scripts/install-backup-cron.sh`, `.env.production.example`, `DOCKER.md`: provide a backup/restore workflow for a separate mounted filesystem, a safe Docker restore test, and daily/monthly cron entries.
- Focused adapter and controller tests cover JPEG naming/type, invalid content, legacy JPEG data in `.png`, concurrent gallery IDs, and returned URLs.

## Verification

- Focused Jest tests: 15 passed after the final upload and legacy-read adjustments.
- Local development backup and restore: 14 MySQL tables and 7 image files restored into a disposable MySQL container.
- Production Node 18 Alpine Docker image built and Sharp decoded a generated JPEG successfully.
- Same-filesystem backup destination was rejected as intended.
- Shell syntax and `git diff --check` passed.

## Remaining work

- The on-premises host currently has no separate backup mount visible, and `.env.production` has no `NETZERO_BACKUP_DIR`. The host has the required tools. Configure an off-host disk or NAS path, deploy the scripts, run `install-backup-cron.sh`, and confirm its production restore test before calling backups operational.
- Preserve unrelated uncommitted deployment and environment changes already present before this task.
