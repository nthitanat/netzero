# General architecture fixed documentation layout

**Status:** Completed, 2026-09-29 Asia/Bangkok; standalone layout clarified and installed.
**Scope:** Publish a shared `general-architecture` release that owns a self-contained architecture/workflow Markdown standard for every project using it. The guideline defines paths relative to the current project's root and requires migration of scattered existing workflow documents. This task does not move NetZero's existing Markdown or change its pinned adoption revision. Preserve unrelated working changes and sensitive data.

## Steps

- [x] Define the required folder layout and migration rule in the owning skill instructions; reconcile existing adoption and project precedence wording.
- [x] Check the rule against NetZero's layout and realistic project adoption cases; keep source-local reference material outside the workflow migration.
- [x] Measure against the previous release, review instruction ownership and loading routes, validate the skill and links, then seal and verify the new release.
- [x] Install and verify both Codex homes, then record results and the separate status of NetZero's existing project pin.

## Guardrails

Existing project-specific deployment/architecture guide content stays authoritative. A shared release does not automatically adopt itself into projects pinned to older revisions. Do not copy credentials or other sensitive raw data into logs.

## Result

Release `da723d59afccde9991da12a009e1c347b2b85cb5a078438567e5805de2c577d7` is installed and verified in both homes, including their default links. The skill owns an explicit directory tree relative to each project, with no reference-project dependency. NetZero remains pinned to its previous revision. See the [tested outcome](../architecture-logs/code-changes/2026-09-29-general-architecture-fixed-doc-layout.md) and [approved shared rule](../architecture-logs/rule-updates/2026-09-29-general-architecture-fixed-doc-layout.md).
