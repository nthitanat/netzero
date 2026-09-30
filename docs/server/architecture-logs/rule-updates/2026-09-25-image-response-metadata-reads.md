# Image response and metadata reads

**Date:** 2026-09-25 Asia/Bangkok
**Status:** Specified by the user and applied.

## Rule

After the product and event image metadata read cutover, use `product_images` and `event_images` to decide image presence and locate files. Batch-load image rows for lists and use indexed lookups for detail, gallery, and binary image requests. Preserve existing absolute `/api/v1` image URLs and gallery IDs. Return a fixed-role URL only when its metadata row exists, `null` when it does not, and 404 for an image request without a row. Keep filesystem lookup only behind the explicit legacy-read rollout switch.

## Rationale and source

An optimistic URL can point to a missing image, while per-item filesystem checks slow list responses. The metadata rows give the API one source for image presence and lookup without changing public routes. The user specified this rule when clarifying the rule question for [product and event image response links](../code-changes/2026-09-24-image-response-links.md) and the follow-on [indexed image metadata feature](../code-changes/2026-09-25-image-metadata.md).

## Validation

The rule is in the short `netzero-architecture` skill and the product and event image section of `netzero-server/docs/GENERAL_ARCHITECTURE.md`. Code inspection confirmed batched row reads in product and event services, row-based fixed-image serialization in controllers, indexed image-route lookup, and legacy lookup gated by `IMAGE_METADATA_READS_ENABLED`. The source feature log records local MySQL, Jest, and React verification. Production cutover remains pending the verified backup destination.
