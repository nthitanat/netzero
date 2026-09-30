# Docker deployment guide refresh

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Completed

## Objective

Replace outdated instructions in the existing `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md` with a current NetZero deployment guide grounded in the repository's Compose files, environment examples, scripts, and rollout status.

## Steps

- [x] Read the architecture handoff and inspect the existing guide and working tree.
- [x] Trace the local and remote workflows in their source files.
- [x] Rewrite the existing guide in place without carrying forward obsolete commands.
- [x] Validate commands and links against the repository; record the result in the architecture logs.

## Scope

Documentation only. Do not run deployment, database reset, or backup commands as part of this guide update.

## Result

The existing guide now documents the split Compose stacks, development database seed and reset behavior, remote deploy menu, host-served React build, production migration boundary, backups, and known rollout status. Markdown links and code fences resolve, both Compose configurations pass `config --quiet` with their example environment files, and `git diff --check` passes. No live deployment or backup was run.
