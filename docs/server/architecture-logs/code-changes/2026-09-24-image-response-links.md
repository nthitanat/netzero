# Product and event image links in API responses

**Date:** 2026-09-24 Asia/Bangkok
**Status:** Tested

## Objective

Add absolute image links to product and event JSON responses, use them in the React client with existing URL helpers as a rollout fallback, and display a real placeholder when image loading fails.

## Changed paths and layer decisions

- `netzero-server/src/controllers/ProductController.js`, `EventController.js`: serializers add `thumbnail_url` and `cover_url` for products, and `thumbnail_url` and `poster_url` for events. They use the request protocol and host, the configured API prefix/version, and the existing public routes. List, detail, create, and update responses use the same serializer. No image existence check or file access was added to serialization.
- `netzero-client/src/components/market/`, `src/components/events/`, `src/components/dashboard/ProductManagementPanel/`, and `src/utils/imageUtils.js`: displayed images prefer response links and keep the current URL helper when a response has no link.
- `netzero-client/src/components/common/ImageSlideshow/`, direct image views, and `public/assets/images/placeholder-image.svg`: failed image requests display a bundled placeholder without an error loop.
- `netzero-server/src/routes/productRoutes.test.js`, `eventRoutes.test.js`, and `netzero-client/src/utils/imageUtils.test.js`: focused contract, route, and fallback checks.

## Verification

- Server Jest: 3 focused suites, 9 tests passed. Both list and detail links were requested through their matching product and event image routes and returned image responses from a test fixture.
- Client Jest: 2 tests passed for response-link preference, legacy URL fallback, and failed-image placeholder behavior.
- React production build completed with `CI=false`; existing repository lint warnings prevent the same build under `CI=true` because warnings are treated as errors. The generated build output was restored to its pre-test working-tree state.
- `git diff --check` passed.

## Remaining work

- No remaining work for this change. The existing on-premises backup setup remains tracked separately in `2026-09-24-image-backup-hardening.md`.
- The user later specified an image response and metadata lookup rule. It was promoted with the follow-on image metadata feature in `../rule-updates/2026-09-25-image-response-metadata-reads.md`.
