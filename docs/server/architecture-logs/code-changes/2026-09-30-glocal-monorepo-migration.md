# Glocal monorepo migration

Date: 2026-09-30 Asia/Bangkok
Status: Local migration and verification complete. Production rollout pending.

## Changes

- Unsquashed subtree import `5d1ef15`, layout/archive commit `58070b3`; KnowledgeHub HEAD `3bdbea5` remains an ancestor. `glocal-client` is active in NetZero, with separate packages and its existing `/glocal` hash routes.
- NetZero/Glocal public inputs come from root environments through Compose, the native client helper, and selective deployment. Glocal API transport now consumes `REACT_APP_API_BASE_URL`; auth/check-in retain `/api/v1` paths and catalog data remains local JSON.
- Development frontend profiles and independent volumes support both/NetZero/Glocal/backend-only. The local private development file adds Glocal's port and CORS origins; credentials remain unchanged.
- One deployment menu/CLI selects frontends and shared main/chat backend independently. Validation is target-specific; selected frontend builds precede service changes/publication. Previous frontends are retained/restored after publication or URL/content failure. Checkout lock, Git askpass, filtered private upload, and selected-service operations are implemented. Backend image/data rollback remains an operator procedure.
- Ignored local deploy files were explicitly captured as inert scripts/placeholders in `archive/glocal-deployment`. Old local checkout entry points are retired and its README points to NetZero. Its Git history, private configuration, and local guide edits remain available. Active guides moved and links/configuration reconciled.

## Verification

- A fresh committed NetZero checkout retained the complete Glocal history, installed both clients from their independent lockfiles, and built both production frontends successfully. The 14 deployment regressions, Compose validation, and local HTTP/CORS checks also passed from that fresh checkout.

- 14 disposable-host regression tests passed, including all seven valid frontend/backend combinations, invalid no-op, omitted backend credentials, second build/swap failures, failed/wrong-content URLs, retained backups, preserved uploaded files, lock contention, menu, and API management isolation. These exercise real Git checkouts and publication directories with simulated npm/Docker/network commands.
- Both production frontend builds passed with existing warnings. Glocal's clean install without legacy peer resolution failed because its TypeScript 6 lock entry conflicts with CRA's optional peer requirement; `.npmrc` retains the prior compatibility mode. Clean install in that mode and the Glocal Docker image build passed.
- All four development Compose selections and production Compose validate. Existing development database volume was reused; both clients and shared APIs started. NetZero runs at `http://localhost:3020`, Glocal at `http://localhost:3002/glocal/`; actual root API is `http://localhost:3021`. Served Glocal bundle contains that local base, excludes the production API, and preserves its prefix. API health and local check-in validation passed.
- Real Axios auth/check-in services reached a disposable local HTTP API, preserving request paths, token propagation, response envelopes, 401 logout/event behavior, and configured Glocal CORS acceptance.
- Protected pre-existing NetZero source/skill changes and original Glocal local guide edits match private pre-import hashes. Current Glocal credentials were checked absent from imported documentation and archived scripts. Production build verification artifacts are outside the working tree.

## Limits and rollout

- Existing Glocal `App.test.js` cannot load `@testing-library/react`; no tests run in that pre-existing suite. Existing strict-build warnings remain outside this repository/configuration migration.
- No GitHub push, live production deployment, live URL verification, or remote KnowledgeHub repository archival has occurred. Push the complete unified NetZero revision, verify the selected production rollout, then archive the old GitHub repository with a NetZero pointer.
- Shared architecture skill and NetZero adoption remain unchanged; conventions stay project-local unless explicitly approved for promotion.
