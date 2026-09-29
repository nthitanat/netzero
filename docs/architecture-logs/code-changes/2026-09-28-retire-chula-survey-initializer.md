# Retire the expired Chula survey initializer

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Complete; static checks passed.

## Objective

Remove the obsolete one-time Chula NetZero survey initializer and its callable npm command.

## Changed paths and layer decisions

- Removed `netzero-server/scripts/initiateChulaSurvey.js`. It defined a survey ending in December 2025 and attempted to register an admin through a public endpoint that now creates ordinary users.
- Removed `survey:init` from `netzero-server/package.json`. No startup, deployment, or application path invoked the script.
- Updated `IMPLEMENTATION-SUMMARY.md` and `netzero-client/docs/REGISTRATION-PAGE.md` so they no longer instruct operators to run the removed command. Kept the historical survey summary as history.
- Left `netzero-server/scripts/backfillImageMetadata.js` intact because the pending production image metadata rollout requires it.

## Verification

- Parsed `netzero-server/package.json` with Node and confirmed `survey:init` is absent.
- Searched the repository for `initiateChulaSurvey` and `survey:init`; no references remain outside dependencies and generated output exclusions.
- `git diff --check` passed.

## Remaining work

The registration page still requests survey ID 1, while canonical fresh-database seeds have no `surveys` or `questions` presets. A supported survey seed or registration-flow change is needed before that flow works with a fresh database. This gap predated the script removal. The separate production seed refresh and image metadata rollout remain in progress as recorded in `CURRENT.md`.
