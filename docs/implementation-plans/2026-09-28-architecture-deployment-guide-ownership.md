# Architecture and deployment guide ownership

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Completed

## Objective

Give the netzero-architecture skill a clear document route: architectural rules in `docs/GENERAL_ARCHITECTURE.md`, deployment operation in the existing `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md`.

## Steps

- [x] Inspect the skill, both guides, handoff, and working tree.
- [x] Update the skill and repository entry point with document ownership and update triggers.
- [x] Remove Docker operating details and stale environment naming from the architecture guide while retaining schema and seed invariants.
- [x] Check references and consistency, then record the approved rule in the architecture logs.

## Scope

Documentation and skill routing only; no deployment or database operation.

## Result

The skill routes deployment work to the existing Docker guide and keeps application architecture in the general guide. The general guide now references the Docker guide for volume and image-file persistence procedures and uses current unprefixed environment variable names. The Docker guide identifies itself as the operating guide, while `DOCKER.md` remains a short command reference. Local Markdown links, skill frontmatter, and `git diff --check` passed. No runtime workflow was changed or executed.
