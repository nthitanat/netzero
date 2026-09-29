---
name: general-architecture
description: Maintain architecture boundaries and a fixed architecture-document layout for Node.js APIs and React applications during edits, reviews, migrations, and related deployment work. Exclude unrelated stacks and non-code writing tasks.
---

# General architecture

Use repository instructions and the project's adopted revision; preserve project-specific technical decisions. The documentation layout below is required in every project adopting this release: reconcile conflicting document paths during adoption. Preserve public behavior and unrelated working changes. Invocation does not authorize broad refactoring, deployment, data resets, or new policy.

Read repository instructions and required compact task indexes first. Inspect working status and affected files; checkpoints are evidence to verify, not proof of current code. Once per session compare this package's `RELEASE.json` revision with project adoption. Recheck only after installation/adoption changes. Resolve mismatches through [Maintenance](references/MAINTENANCE.md#revision-resolution); never silently use the newest release. If adopted instructions are unavailable, disclose that limit, continue adequately covered work under repository rules, and obtain missing guidance before dependent decisions.

## Load by task

Read only the named sections and applicable project guidance. Reuse unchanged guidance already read; expand when discovered dependencies, contracts, or risks require it and record material reasons. The extraction plan and release history are not routine task inputs.

| Task | Additional reading |
| --- | --- |
| Small styling/text edit | Local UI conventions and affected component/callers; [UI data](references/ARCHITECTURE-GUIDELINES.md#ui-data) only if data ownership is touched |
| API behavior | [Responsibilities](references/ARCHITECTURE-GUIDELINES.md#responsibilities), [Contracts](references/ARCHITECTURE-GUIDELINES.md#contracts), [Errors](references/ARCHITECTURE-GUIDELINES.md#errors); affected request path |
| Database workflow | [Persistence](references/ARCHITECTURE-GUIDELINES.md#persistence), [Transactions](references/ARCHITECTURE-GUIDELINES.md#transactions); schema/seeds only when affected |
| Docker/deployment | Project deployment guide, affected Compose/scripts/environment examples; [Environments](references/ARCHITECTURE-GUIDELINES.md#environments) |
| First adoption/unresolved boundary | [Adoption](references/ADOPTION.md) and relevant technical sections |
| Install/update/revision mismatch | [Maintenance](references/MAINTENANCE.md) |
| Review only | Requested evidence and applicable rules; no implementation scaffolding |

Leave unrelated specialist sections unread. Existing adopted projects do not repeat first-use audits. Project-required records still apply.

## Work and completion

Keep transport, business policy, persistence, provider I/O, server-state caching, and UI state with their adopted owners. Inspect immediate callers/dependencies for focused edits and the affected end-to-end path for features or migrations. Resolve ambiguity from actual contracts and project decisions before introducing a boundary change.

Run applicable existing checks and focused verification of changed success/failure behavior; include authorization, async errors, rollback, concurrency, or recovery when affected. Report what passed, what was not verified, and remaining risks. Claim automated enforcement only for rules covered by passing checks.

Use the fixed architecture-document layout: `docs/GENERAL_ARCHITECTURE.md` for adopted boundaries; `docs/implementation-plans/` and its `CURRENT.md` for plans; `docs/architecture-logs/` and its `CURRENT.md`, `code-changes/`, and `rule-updates/` for outcomes and approved rules. Create plans, outcomes, and rule-update Markdown only in those folders; keep durable project-wide guides under `docs/`. On adoption, inventory and move scattered architecture/workflow Markdown to its owner and repair links; later move misplaced documents when encountered. Follow [Adoption: Records](references/ADOPTION.md#records) for migration and document exceptions. Checkpoint unfinished implementation, keep sensitive data out of records, and distinguish intended work from outcomes. Rewrite superseded instructions in place; history belongs in records. Promote reusable guidance only with existing or newly obtained authorization through [Maintenance: Shared rules](references/MAINTENANCE.md#shared-rules).
