# Adoption

## Bounded evidence

On first adoption, map repository instructions, existing guides, package manifests, structure, and configured checks. Inspect the affected area and representative request paths for relevant processes; include persistence, seeds, Docker, and environment examples when involved. Exclude dependencies, generated output, and unrelated areas from detailed reading. Record inspected paths, evidence, unknowns, and coverage in the task record. Expand only for findings affecting correctness/safety; a comprehensive audit is separate scope.

Record the complete package's immutable revision from `RELEASE.json`, its obtainable source, resolution path, adopted project boundaries, and exceptions in repository instructions or their adoption record. Use [Maintenance](MAINTENANCE.md) to install/verify before routing to it. Shared releases do not silently update adoption.

## Classify differences

Compare implementation, adopted current/target rules, and shared recommendations:

| Finding | Action |
| --- | --- |
| Stale factual description | Correct within existing authorization; report evidence |
| Intentional target awaiting migration | Preserve target; record current implementation/status |
| Accepted exception | Apply documented project decision |
| Defect against adopted rules | Fix within authorized scope; record unrelated defects for later |
| Insufficient evidence | Record unresolved finding; do not invent policy |

Code drift does not justify rewriting an intended target. A skill invocation does not authorize repository-wide refactoring. If the user retains the architecture, document/apply it without repeatedly proposing migration. Respect refusal to change documentation and disclose handoff limits. Reuse existing authorization for corrections; ask only about unresolved policy decisions or scope expansion after preparing a concrete proposal.

## Records

This skill owns the following fixed layout, rooted in the current project. Each project maintains its own documents; no reference project or external checkout is required.

```text
docs/
├── GENERAL_ARCHITECTURE.md
├── implementation-plans/
│   ├── CURRENT.md
│   └── <task>.md
└── architecture-logs/
    ├── CURRENT.md
    ├── code-changes/
    │   └── <task>.md
    └── rule-updates/
        └── <rule>.md
```

`GENERAL_ARCHITECTURE.md` owns the adopted system map and boundaries. The two `CURRENT.md` files index plans and architecture records respectively. Create the guide and indexes during adoption, using concise verified facts; create record subfolders when first needed, and keep each index current. A small task can use one compact plan and one compact outcome; do not duplicate narratives. Review-only work outside adoption does not scaffold records unless requested.

At adoption, inventory existing architecture/workflow Markdown, classify each by its current purpose, and move misplaced plans, outcomes, and rule records into the matching folder. Consolidate or link duplicate records; do not silently leave scattered copies as active guidance. Move an existing architecture guide to its canonical path, or build that guide from verified facts when no guide exists. Keep durable project-wide specialist/operator guides under `docs/` with their project-defined names. Preserve source-local README, component usage notes, and subsystem reference guides outside this workflow. Update repository instructions, active links, and indexes; verify targets after moves. On later work, relocate newly encountered misplaced workflow documents rather than creating another location. If a candidate contains secrets, secure or redact it before migration; do not copy sensitive data into a new record. If a move would break an external contract or disturb unrelated work, record the concrete exception and a safe migration path before claiming alignment.

Indexes contain topic, status/blocker, and link; retain active safety blockers while moving history to linked records. Load only relevant linked records. Plans hold intended work, logs hold outcomes/checkpoints, and rule updates hold actual rule/adoption changes. Avoid copying narratives between them. Never record secrets or raw sensitive data.
