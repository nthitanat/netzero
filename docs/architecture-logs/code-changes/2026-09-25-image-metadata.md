# Indexed image metadata and nullable image links

**Date:** 2026-09-25 Asia/Bangkok
**Status:** Implemented and tested locally; not deployed to production.

## Objective

Return `null` for absent fixed product and event images, preserve `/api/v1` image routes and existing gallery numbers, and read ordered galleries and list image presence from indexed MySQL rows instead of filesystem checks.

## Changed paths and layer decisions

- `netzero-server/sql/2026-09-25-image-metadata.sql`: additive `product_images` and `event_images` tables, fixed-role uniqueness, gallery number uniqueness, parent indexes, image size/version, legacy gallery modification time, and `products.next_gallery_image_number`.
- `netzero-server/src/models/ProductImage.js`, `EventImage.js`: parameterized metadata reads and writes. Product gallery allocation locks the parent product row in a short transaction.
- `netzero-server/src/services/ProductService.js`, `EventService.js`: one batched image-row query per nonempty list, indexed detail/gallery reads, upload/metadata orchestration, rollback cleanup, and legacy read fallback during cutover. Event image routes have no upload writer; the backfill script is the operator import path.
- `netzero-server/src/adapters/productImageStorage.js`, `eventImageStorage.js`: file validation and unique replacement names remain in adapters. Old fixed-role files are removed only after the metadata transaction commits. Files are resolved from stored paths within the upload root.
- `netzero-server/src/controllers/ProductController.js`, `EventController.js`: four fixed URL fields become string or `null` after cutover; routes and gallery response fields remain. Event images use stored MIME type.
- `netzero-server/src/config/env.js`, `.env.production.example`, `docker-compose.prod.yml`: separate read and upload cutover switches propagated to the container. Production defaults to both switches off until backfill is complete; the upload pause prevents a new gallery number from colliding with an unindexed legacy file.
- `netzero-client/src/utils/imageUtils.js` and affected market, event, dashboard, and slideshow components: only `undefined` falls back to the old URL helper. Explicit `null` displays a placeholder and is omitted from slideshow items; failed requests still use `onError`.
- `netzero-server/scripts/backfillImageMetadata.js`, `docs/image-metadata-rollout.md`: idempotent legacy file import, audit and aged orphan cleanup, verified-backup gate, staged deployment sequence, and event operator process.

## Verification

- MySQL 8.0 disposable container: migration applied; a four-file product/event fixture backfilled twice with four rows and no mismatches; existing gallery IDs 7 and 9 stayed unchanged and the next number became 10.
- Eight concurrent real MySQL reservations returned unique numbers 10–17 and advanced the product counter to 18. Batched model reads and fixed-role replacement/version increment also passed on that container.
- A second disposable MySQL/files fixture reported an interrupted orphan, removed it only after it was aged beyond 24 hours with `--prune`, and returned a clean `--audit` result. Both disposable containers and fixtures were removed.
- The final schema/backfill revision was reapplied on disposable MySQL, and a legacy gallery file's `2020-01-01` modification time was preserved in the gallery response mapping. That container and fixture were removed.
- An event import fixture was backfilled twice without changing version 1; replacing its file and rerunning the import advanced the version to 2. Its disposable MySQL container and files were removed.
- Server Jest: 23 suites, 84 tests passed after the rollout guard. Client image utility tests: 4 passed.
- React production build passed with `CI=false`; existing repository lint warnings remain. Generated build output was restored. Production Compose config and safe-off production switch defaults validated; `git diff --check` passed.

## Remaining work

- Production migration and cutover are pending. The separate disk or NAS backup destination in `CURRENT.md` is still outstanding; take and verify both MySQL and image-file backups before applying the SQL migration.
- After production rollout, run backfill/audit, enable uploads, deploy React, enable nullable reads, and measure image traffic. Follow `docs/image-metadata-rollout.md`.
- The user approved a reusable rule for staged metadata cutovers and orphan audits; it is recorded in `docs/architecture-logs/rule-updates/2026-09-25-staged-metadata-cutovers.md`.
