# Public frontend permissions during remote deployment

**Date:** 2026-10-01 Asia/Bangkok  
**Status:** Fixed and live rollout verified

The remote deployment wrapper starts its SSH script with `umask 077`. That setting reached the React build and made new build directories and files private. The host helper copied those modes into the web root, so the public `/netzero/` check returned 403 after the backend health checks had succeeded. Its rollback restored the previous frontend builds. The main and chat APIs were healthy; the 403 was a static-file access failure.

`scripts/deploy-on-host.sh` now applies `chmod -R a+rX` only to each staged public build before swapping it into the web root. The private environment upload and checkout configuration remain mode 600. A deployment regression simulates the inherited private umask and public web access; it failed before the fix and passed afterward. All 15 deployment tests, shell syntax checks, and `git diff --check` passed.

Using the corrected local helper, a frontend-only deployment of both NetZero and Glocal completed with release `20261001T013320Z-2817988`; backend deployment was skipped. Live verification showed each published directory at mode 755 and its `index.html` and main JavaScript file at mode 644. Both public pages and both main JavaScript assets returned HTTP 200. Main and chat `/health` also returned 200. The host checkout remained at repository commit `024607e`; this helper change is still uncommitted locally and must be committed/pushed to make it available from another checkout.
