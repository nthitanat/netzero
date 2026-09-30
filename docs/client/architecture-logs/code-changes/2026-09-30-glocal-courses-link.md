# Glocal course entry point in NetZero

**Date:** 2026-09-30 Asia/Bangkok

## Change

Added `/courses` to the NetZero client router and shared navigation, with a public page linking to the existing Glocal catalog at `https://engagement.chula.ac.th/glocal/#/courses`. Added the `school` icon to the navigation icon component. Glocal remains the owner of course content and detail pages.

## Evidence

- The Glocal client already routes `/courses` and `/courses/:id` through its HashRouter.
- The Glocal deployment script sets the production web root to `/glocal` on `engagement.chula.ac.th`.
- `npm run build` in `netzero-client` completed with exit code 0 on 2026-09-30. It reported existing lint warnings outside the new course page.
- Generated build output was restored after verification so only source and documentation changes remain.

## Limit

The new NetZero page is a navigation bridge. It does not duplicate course data, add a course API, or implement the broader Glocal course management work specified in the separate TOR draft. No production deployment or live remote link check was performed.
