# Glocal into NetZero migration

Date: 2026-09-30 Asia/Bangkok
Status: Local migration and verification complete. Production rollout pending.

## Authorized scope

Implement the supplied migration: preserve Glocal history and both dirty checkouts, import its React frontend as `glocal-client`, share NetZero root configuration and APIs, add development selection, unify deployment selection, and retire old Glocal deployment tooling. Catalog JSON and client UI architecture retain their owners. Live deployment and retiring the GitHub repository follow verified rollout.

## Steps

All five implementation/verification steps completed. Tested results are in [the migration record](../architecture-logs/code-changes/2026-09-30-glocal-monorepo-migration.md).

1. Preserve current changes and import local KnowledgeHub main history without squashing in an isolated checkout; move source and reconcile local documentation edits.
2. Make both public frontend builds consume root environment inputs; add Glocal development port, mounts, dependency volume, and CORS origin.
3. Add independent frontend/backend deployment choices with target-specific validation, build-before-publish, retained rollback copies, and selected URL checks.
4. Capture ignored Glocal deployment files as inert retired scripts and sanitized configuration examples; reconcile active guides.
5. Validate fresh checkout, Compose profiles, configured local HTTP requests, every target combination and publication failures using isolated fixtures, and production builds.

## Evidence and boundaries

- NetZero HEAD `925c42a`; Glocal HEAD `3bdbea5`. Both have unrelated uncommitted work, saved privately before import.
- Glocal uses CRA 5, React 18, `/glocal` homepage and HashRouter. Auth and check-in paths include `/api/v1`; API base must not duplicate it.
- Existing production Compose owns main/chat APIs and uploaded files; production database workflow is unchanged.
- Project uses general-architecture revision `1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf`; installed default is newer, so adopted immutable guidance is loaded.
- Existing frontend warnings/testing setup and production rollout constraints must be reported separately from migration checks.
