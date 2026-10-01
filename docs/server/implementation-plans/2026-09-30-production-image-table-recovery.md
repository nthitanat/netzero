# Production image table recovery

**Date:** 2026-09-30 Asia/Bangkok  
**Status:** Complete

## Scope

Create only the missing `product_images` and `event_images` tables in the live `netzero` database, using the matching canonical seed CREATE files. Do not alter existing tables, insert image rows, or enable image-metadata switches. The user explicitly directed this limited change without a backup.

## Checks and steps

1. Confirm the deployed seed files match the local revision, both target tables are absent, and `products.id` and `events.id` match the seed foreign keys. Complete: deployed revision `024607e`, MySQL 8.4.5, signed `INT` parent IDs, both tables absent.
2. Record baseline API status. Complete: `/health` 200; one event-list and one product-list request each 500 because the new tables are absent.
3. Apply only `sql/seed/create/16-product_images.sql` and `sql/seed/create/17-event_images.sql` from the deployed checkout. Complete: both tables created, with no inserts.
4. Verify both table schemas, that existing parent tables were not altered, and that the affected API routes return success. Complete: both tables have their declared constraints and zero rows; the parent `SHOW CREATE TABLE` output remained unchanged; health, event-list, recommended-event, and product-list requests returned 200. Metadata feature switches remain at their production defaults pending separate backfill/cutover work.
