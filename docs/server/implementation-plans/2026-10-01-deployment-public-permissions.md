# Public frontend permissions during remote deployment

**Date:** 2026-10-01 Asia/Bangkok  
**Status:** Complete

## Cause and scope

The SSH wrapper sets `umask 077` to protect temporary credentials. The host helper inherits it when building React files, then copies their private permissions into the web root. The public URL check receives HTTP 403 even though the backend health checks pass. Keep the credential permissions and deployment rollback behavior intact.

## Steps

1. Reproduced the restrictive-mode publication in a disposable deployment test: the new test failed at the public URL check before the fix.
2. Made only the staged public frontend build trees readable/traversable before publication. Private uploaded configuration remains mode 600.
3. The focused regression and all 15 deployment tests passed. Deployed both frontends with backend skipped, then verified public pages and main assets return 200 and backend health remains 200. The fix is in the local working tree; the production repository still points at commit `024607e` until this script change is committed and pushed.
