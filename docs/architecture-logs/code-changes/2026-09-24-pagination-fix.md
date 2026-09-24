# Pagination binding and client paging

**Status:** Complete, tested on 2026-09-24.

## Objective and changes

- Fixed `ER_WRONG_ARGUMENTS` on list endpoints by binding validated `LIMIT` and `OFFSET` values as decimal strings in the main server's affected models: Event, Product, ChatApp, EventProduct, ProductReservation, GlocalCheckin, User, and survey Answer, Response, and Survey.
- Changed `netzero-client/src/api/events.js` and `netzero-client/src/pages/Marketplace/useMarketplace.js` to request full collections in pages of 100 instead of sending `limit=1000`.
- Kept SQL in models, pagination validation in validators, and HTTP calls in client API/UI code. The existing `/api/v1` response contract and 100-item maximum were retained.

## Verification

- Main server: 63 tests passed across 22 suites.
- Client: production build completed with existing lint warnings.
- Running development API: events, recommended events, market products, and chat apps list requests returned HTTP 200; nonzero offsets also returned HTTP 200. An explicit `limit=1000` still returned HTTP 400 as intended.
- `git diff --check` passed.

## Resume note

No further work is recorded for these two errors. The repository had other uncommitted changes before this task; inspect the current diff before editing related files.
