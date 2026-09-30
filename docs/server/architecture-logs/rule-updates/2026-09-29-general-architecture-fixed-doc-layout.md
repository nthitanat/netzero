# Shared fixed architecture document layout

**Date:** 2026-09-29 Asia/Bangkok

**Source:** User instruction to make NetZero's architecture/workflow folder layout mandatory in the shared `general-architecture` skill for every project adopting the new release.

## Rule

An adopting project uses `docs/GENERAL_ARCHITECTURE.md`, `docs/implementation-plans/CURRENT.md` and task plans, plus `docs/architecture-logs/CURRENT.md`, `code-changes/`, and `rule-updates/`. Durable project-wide specialist and operator guides live under `docs/`. During adoption, inventory and move scattered architecture/workflow Markdown into its owning location, then repair active links, instructions, and indexes. Preserve source-local subsystem references and component usage notes. Newly encountered misplaced workflow records are moved during later work. Do not claim alignment while a documented migration exception remains.

This is a shared rule in release `fe675a8657c8c24f6a19231214de7dd0cf60bea73b0cdf7f15d63612620bf525`. NetZero's own adopted revision stays at `1dd6330013a3b8e2dff256ed35bb9a485320c816b77ca7c132a70a50a56da0bf` until separately changed; its repository-specific documentation instructions remain active.

## Verification

The source package verified, 13 isolated release tests passed, relative package Markdown targets existed, and Ruby parsed the skill frontmatter. Both default links and immutable copies verified in the two Codex homes. The Python skill validator could not start because PyYAML is unavailable; no claim of that validator passing is made.

## Clarified ownership

The shared skill owns the directory standard itself, independently of the project that inspired it. Each consuming project maintains its own documents at those paths. Release `da723d59afccde9991da12a009e1c347b2b85cb5a078438567e5805de2c577d7` makes that ownership explicit and includes the standalone tree; both installed defaults now resolve to this release.
