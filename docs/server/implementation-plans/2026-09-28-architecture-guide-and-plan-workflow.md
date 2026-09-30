# Architecture guide relocation and plan workflow

**Date:** 2026-09-28 Asia/Bangkok  
**Status:** Completed

## Objective

Move the architecture guide to top-level `docs/`, place implementation plans in `docs/implementation-plans/`, and make the skill and repository guidance maintain plans there for future implementation work.

## Steps

- [x] Inspect the working tree, existing architecture log, guide, and references.
- [x] Move the edited guide and existing database seeding plan without replacing their contents.
- [x] Update active path references and workflow instructions.
- [x] Validate moved files, references, and skill format; record the final outcome in the architecture logs.

## Scope

This task changes documentation and skill instructions only. Existing implementation work and historical logs remain as found.

## Result

Active references and both `CURRENT.md` indexes resolve to existing files. `git diff --check` passed. Ruby YAML parsing confirmed the skill frontmatter. The skill creator's Python validator could not run because PyYAML is unavailable in the local Python environment.
