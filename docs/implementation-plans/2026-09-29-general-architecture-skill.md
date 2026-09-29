# General architecture skill extraction

**Status:** Completed on 2026-09-29. Source package: `skills/general-architecture/`; identical content-addressed release installed and verified in both Codex homes, NetZero route adopted, predecessor archived. See acceptance evidence below.
**Scope:** Create a reusable architecture skill for Node.js API and React projects, replace NetZero's dedicated skill after parity checks, and retain project-specific rules in the repository. Application refactoring, database resets, deployment changes, and new CI enforcement are separate work.

## Deliverables and rule ownership

Maintain one version-controlled skill source, distributed to both `~/.codex/skills/general-architecture/` and `~/.codex-office/skills/general-architecture/`. The installed copies are distributions, not independent authorities. Use a concise description that activates for relevant Node.js/React architecture work and excludes unrelated stacks.

Each detailed rule has one owner. Short reminders and links are allowed; independently maintained copies of procedures are not. During extraction, inventory existing rules and map each to its destination before retiring the old skill.

| Owner | Contents |
| --- | --- |
| `SKILL.md` | Scope, authority, task routing, essential safeguards, focused verification, and completion requirements |
| `references/ARCHITECTURE-GUIDELINES.md` | Shared technical principles, indexed by responsibility, contracts, errors, transactions, persistence/seeds, UI data, and environments |
| `references/ADOPTION.md` | Bounded first-use audit, difference classification, and fallback documentation workflow |
| `references/MAINTENANCE.md` | Shared-rule promotion, releases, installation, verification, upgrades, and rollback |
| Project `AGENTS.md` or equivalent | Skill route, adopted source/revision, and project plan/log requirements |
| Project architecture guide | System map, adopted boundaries, concrete paths/contracts, exceptions, and migration status |
| Project deployment guide | Operator commands, service/environment names, storage, backup, reset, and deployment procedures |
| Plans and architecture logs | Task scope, decisions, verification, checkpoints, and history |

These reference paths are planned skill-package files, not new NetZero workflow documents. NetZero keeps `docs/GENERAL_ARCHITECTURE.md` and `docs/DOCKER-AND-DEPLOYMENT-GUIDE.md` as its project authorities. The extraction plan is a build specification and must not become a routine feature-work dependency.

## Loading contract and size target

Aim for a 300–500-word `SKILL.md` body, excluding YAML metadata. This is an editorial target, not a platform limit: justify any excess by a requirement that cannot safely move to a reference. Do not pad shorter complete instructions. Keep full seed, migration, installation, and rule-maintenance procedures out of the entry point.

Start with repository instructions, the entry point, and any required compact task index. Select relevant reference sections by their headings; do not read every reference or the entire technical guide by default. Keep reference links direct from the entry point or its routing table. Reuse already-read, unchanged guidance within the session. Re-read after a relevant file/revision change or loss of needed context. Expand coverage when dependencies, contracts, or risks discovered during inspection require it, and record the reason in the task record when material.

| Task | Additional guidance to load | Normally leave unread |
| --- | --- | --- |
| Small styling or text edit | Applicable UI conventions and required task record; inspect the affected component | Backend, database, deployment, adoption, maintenance |
| API behavior change | Affected responsibilities, API contract, and error sections | Unaffected seeds, deployment, and maintenance |
| Database workflow change | Persistence, transaction/concurrency rules; schema, seed, or migration sections if affected | Unrelated UI and skill maintenance |
| Docker/deployment change | Relevant deployment-guide sections and affected configuration; architecture sections for crossed boundaries | Unrelated resource migrations and UI |
| First adoption or unresolved architecture decision | Adoption procedure and relevant technical sections | Unaffected specialist rules and release procedures |
| Skill install/update or detected revision mismatch | Maintenance procedure and affected adoption decisions | Unrelated application rules |
| Review-only task | Requested evidence and applicable rules | Implementation scaffolding and unrelated history |

The exclusions apply only while those concerns remain unaffected; they do not override project requirements or suppress necessary safety checks. Compose tasks need affected scripts and environment examples; feature work needs the affected request path, not unrelated resources. An existing adopted project does not repeat first-use adoption on each task.

## Distribution and project authority

Publish shared-rule changes independently of NetZero. Work in another project must not need a NetZero checkout. Each project adopts an immutable revision of the complete skill and records its source and exceptions; explicit project rules take precedence over general defaults. A shared release does not silently change project adoption.

Before switching NetZero's route, document repeatable installation, verification, update, and rollback commands in the maintenance reference. Creation and release updates must install the same selected revision in both configured Codex homes and verify revision and complete contents. Report and repair partial installation before claiming completion. Keep release history in the source and adoption decisions in project records.

For routine use, compare the active home's installed revision with the project's adopted revision once per session, and repeat only when the installation or adoption changes. Full dual-home verification belongs to installation/update work, not each code edit. A mismatch selects the maintenance route. Support immutable revision-specific copies or project-local resolution for differing project revisions; never overwrite a shared installation used by another active task.

If adopted instructions are unavailable, use repository rules for work they adequately cover and disclose the limitation; obtain missing instructions before decisions that depend on them. Do not substitute the newest release. Review compatibility and migration needs before changing adoption. Reuse existing authorization; prepare a concrete proposal only for unresolved policy changes or scope expansion. NetZero compatibility is checked during NetZero adoption, not every shared release.

## Adoption and proportional records

On first adoption, map repository instructions, the existing guide, package manifests, structure, and configured checks. Inspect the affected area and representative request paths for relevant processes. Inspect persistence, seeds, Docker, and environment examples when involved. Exclude dependencies, generated artifacts, and unrelated application areas from detailed reading. Record inspected paths, evidence, unknowns, and coverage; expand only for findings affecting correctness or safety. A comprehensive audit is separately scoped.

Compare observed implementation, adopted current/target rules, and shared recommendations. Classify differences before acting:

| Difference | Action |
| --- | --- |
| Stale factual description | Correct within existing authorization and report the correction |
| Intentional target awaiting migration | Preserve the target and record implementation status |
| Accepted exception | Apply the documented project decision |
| Code defect against adopted rules | Fix within authorized scope; record unrelated defects for later |
| Insufficient evidence | Record an unresolved finding; do not invent a policy decision |

Code drift is not authority to rewrite a target. A skill invocation alone does not authorize repository-wide refactoring. When the user retains the existing architecture, document and apply it without repeatedly proposing migration. Respect a refusal to change documentation and state the resulting handoff limits.

Follow existing project record requirements. NetZero retains its plan, code-change log, indexes, and approved rule-promotion workflow. Elsewhere, reuse equivalent issue, PR, task, or architecture records. For a small task without a mandated workflow, one compact record covers scope, affected paths, adopted rules, verification, outcome, and remaining work. Use an existing location or one file under `docs/implementation-plans/`; do not require multiple folders and indexes.

For larger work lacking an equivalent workflow, use `docs/implementation-plans/` and `docs/architecture-logs/`, with `CURRENT.md`, `code-changes/`, and `rule-updates/` created as needed. Without a guide, begin with inspected facts and unknowns in the task record; create `docs/GENERAL_ARCHITECTURE.md` when work establishes shared boundaries or spans multiple resources. Distinguish current implementation from proposed targets. Review-only work does not scaffold files unless requested.

Keep each `CURRENT.md` a compact task index: topic, status/blocker, and link. Put detailed status and history in linked records; preserve active safety blockers when shortening indexes. Load only relevant linked records. Plans hold intended work; logs hold outcomes/checkpoints, and rule-update records hold actual rule/adoption changes. Avoid copying the same narrative between them. Checkpoint unfinished work and never record secrets or raw sensitive data.

## Technical rules to preserve

These requirements belong in the technical reference under separate headings; they are not a checklist to load in full for every task.

1. **Responsibilities and dependencies:** separate transport, business policy, persistence, external I/O, server-state caching, and UI state. For layered APIs, routes bind middleware/controllers; validators handle input shape; controllers translate HTTP; services own policy, stored-fact authorization, orchestration, and transaction boundaries; models/repositories own parameterized access and row mapping; adapters own provider/storage I/O. Map these responsibilities to the framework without mandatory folders or pass-through files. Define allowed dependencies, use clear named inputs, keep generic utilities pure, and place business policy or effectful shared code with its owner.
2. **Contracts and React data:** map external/database names at boundaries and preserve public behavior unless deliberately migrating. API clients own HTTP transport and mapping; query hooks, loaders, or the adopted data layer own caching/invalidation; components/UI hooks own presentation and UI state. Do not add a competing cache.
3. **Errors:** use stable types/codes, explicitly safe public messages, and retained internal causes. Give HTTP, streams, and workers appropriate error boundaries using the installed framework's async behavior. In Express, delegate when headers are already sent. Log once at the owning boundary with correlation and redaction; keep credentials and sensitive/provider details out of responses and logs. Unexpected HTTP failures get safe generic responses. Avoid message-text classification and duplicated response formatting. Verify relevant async rejection, known/unexpected failure, redaction, and started-response cases.
4. **Transactions and side effects:** use one transaction connection/context for the unit of work, without fallback to a pool; commit after conditions/writes succeed, roll back on failure, and release resources. Protect concurrent invariants through constraints, conditional updates, or locks. Avoid slow provider calls inside transactions. Required external side effects need durable handoff or explicit recovery; database rollback cannot undo another system. Define idempotency, bounded retries, and duplicate handling where retries occur. Verify affected rollback, cleanup, concurrency, and recovery behavior.
5. **Schema and seeds:** separate canonical schema, reviewed presets, and development fixtures; order dependencies; retain historical migrations. Use reviewed live migrations and verified backups. Initialize development data only on new empty storage; retain data across restarts. Never reset/reseed production during ordinary deployment. NetZero's per-table SQL layout remains project-specific.
6. **Environments:** align configuration contracts/examples while preserving intentional development/production differences. Keep secrets server-side and out of React build variables; validate Compose without exposing resolved secrets. Distinguish persistent development and production storage and document operator procedures in the project deployment guide.
7. **Verification:** check immediate callers/dependencies for focused edits and the affected end-to-end path for features/migrations. Test relevant success/failure behavior and contracts; run applicable existing checks. Report scope, results, and exceptions. Claim automated enforcement only for rules covered by passing checks; other consistency remains review-guided. New NetZero import-boundary/configuration gates are separate work, with existing violations deliberately baselined or migrated.

## NetZero parity requirements

Preserve `/api/v1` fields and behavior; the mysql2 decimal-string pagination binding workaround; product/event image metadata, public paths/IDs, rollout switches, staged backfill and recovery rules; exact SQL seed layout and fixture separation; verified versus pending tooling status; development-volume/reset rules; Compose, backup, and deployment details; naming exceptions; and current migration blockers.

Keep these details in their repository owners. Preserve NetZero's required start/resume, plans/logs, rule-promotion authorization, and documentation locations. Replace superseded wording in place and retain unrelated uncommitted work. Do not retire the old skill until its unique rules and active references have been accounted for.

## Implementation sequence

1. Inventory and classify existing instructions; produce the ownership/parity map.
2. Build the version-controlled package with the entry point and references defined above. Implement the distribution procedure and install the selected revision in both homes.
3. Adapt NetZero's instructions to the adopted source/revision. Remove duplicate procedures, retain project exceptions, and compact indexes by moving detail into linked records without losing blockers.
4. Run the acceptance checks below and resolve failures before switching the active route and retiring the old skill. Validate the new route in both environments.
5. Record results, remaining work, and extraction status in the existing plan/log workflow.

## Acceptance checks

- **Package:** skill validator passes; description activates for intended tasks and excludes unrelated stacks; entry-point word count meets its target or has a documented justification. Each detailed rule has one owner and working direct reference links.
- **Distribution:** installation/update/rollback procedures are exercised, both homes match, partial updates are detected, and mismatched/unavailable revisions follow the documented fallback. A release works without NetZero access; projects can retain different adopted revisions.
- **Adoption:** scenarios cover each difference classification, retained architecture, missing guides, already-authorized corrections, and unresolved policy changes. Verify evidence/coverage and proportional records without unsolicited refactoring.
- **Safety and parity:** compare the ownership map against the original skill and guides, including all technical and NetZero parity requirements. Check framework-owned React caching and applicable error/transaction safeguards. Preserve project workflows and existing changes.
- **Efficiency:** exercise a styling-only edit, API behavior change, database transaction change, Docker change, first adoption, review-only task, and skill update. For each, record expected/actual files and sections read, instruction words loaded (tokens if measurable), avoidable tool calls, and resulting correctness. Use fresh-session cases to measure initial loading and a same-session follow-up to check unnecessary rereads/revision checks. Required project context is counted separately from optional references.
- **Loading exclusions:** the styling case must avoid database, deployment, adoption, maintenance, and extraction-plan bodies unless a concrete discovered dependency justifies expansion. API work must avoid unrelated specialist sections. Update cases must verify both homes. A small first task must not trigger a full repository audit or multiple fallback records. Any unexpected loading is explained and corrected; reducing reads must not omit applicable safeguards.
- **Completion:** active NetZero routing resolves the new skill in both environments; no active instructions call the retired skill. Logs distinguish verified behavior from pending work and do not claim new CI enforcement or application/deployment changes.


## Completion evidence

- [Created package and tested outcomes](../architecture-logs/code-changes/2026-09-29-general-architecture-created.md).
- [Ownership inventory and NetZero parity](../architecture-logs/code-changes/2026-09-29-general-architecture-parity.md).
- [Fresh-context loading cases and corrections](../architecture-logs/code-changes/2026-09-29-general-architecture-loading.md); counts are actual selected instruction words, not model tokens or application integration coverage.
- [Authorized adoption and recovery](../architecture-logs/rule-updates/2026-09-29-general-architecture-adoption.md).

All five implementation steps are complete. Source and both installations pass the skill validator; seven isolated distribution tests pass. Direct package links, content/revision parity, project routing, and removal of active predecessor references were verified. Existing production/migration blockers remain unchanged in the architecture index. No application refactoring, data reset, deployment, new CI enforcement, Git commit, or remote publication occurred.
