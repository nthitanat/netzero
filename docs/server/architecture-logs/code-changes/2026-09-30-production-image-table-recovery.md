# Production image table recovery

**Date:** 2026-09-30 Asia/Bangkok  
**Status:** Live schema change complete

The production main API was healthy but event and product reads returned HTTP 500 with `ER_NO_SUCH_TABLE` for `event_images` and `product_images`. The live MySQL 8.4.5 database had neither table. The deployed checkout was `024607e`; its two canonical seed CREATE files matched the local checksums. Existing `products.id` and `events.id` were signed `INT`, matching the child foreign keys.

At the user's explicit direction, applied only `netzero-server/sql/seed/create/16-product_images.sql` and `17-event_images.sql` to the live `netzero` database. No existing table was altered, no rows were inserted, and no backup was made. The user specifically limited the work to creating those two tables and waived a backup; the server had no separate mounted backup destination. This is an exception for this operation, not a change to the deployment guide's normal backup procedure.

Verification: both new tables exist with their seed primary, foreign-key, unique, and check constraints; both have zero rows. `SHOW CREATE TABLE` for the existing `products` and `events` tables was identical before and after. Main and chat `/health` returned 200; the event list, recommended events, and product list changed from 500 to 200. The public `/netzero/` and `/glocal/` pages returned 200 after the earlier frontend rollback. No frontend was republished. The metadata read/upload switches remain unset in the production environment, so their production defaults are off. Image backfill and cutover remain pending under the existing image-metadata work.
