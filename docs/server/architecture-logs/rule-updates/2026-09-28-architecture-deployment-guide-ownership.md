# Separate architecture and deployment guide ownership

**Date:** 2026-09-28 Asia/Bangkok  
**Source:** User-specified separation of deployment instructions from the general architecture guide.

## Rule

For NetZero feature and migration work, use `docs/GENERAL_ARCHITECTURE.md` for layer boundaries, contracts, schema and seed rules, and migration principles. For Docker or deployment work, read the relevant parts of the existing `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md` and the affected Compose files, scripts, and environment examples; update the Docker guide in place when the operational workflow changes. Consult both guides when a change crosses their responsibilities and keep shared safety requirements consistent. `DOCKER.md` is a short command reference.

## Rationale

The two guides have distinct readers and rates of change. Keeping commands, host paths, Compose details, and backups in the Docker guide prevents operational examples from becoming stale inside the architecture rules.

## Validation

The skill, `AGENTS.md`, both guides, and `DOCKER.md` now state the same ownership. The general guide no longer contains the volume-removal command or outdated `DEV_`/`PROD_` naming example. Local Markdown links resolved, Ruby parsed the skill frontmatter, and `git diff --check` passed. This was documentation-only; no deployment or database command was run.
