# NetZero coding entry point

For NetZero source changes, use the `netzero-architecture` skill. Its short entry point contains the layer check for small edits; read only relevant sections of `netzero-server/docs/GENERAL_ARCHITECTURE.md` for features, migrations, or unclear boundaries.

Read `docs/architecture-logs/CURRENT.md` when starting or resuming work. After changing code, record the tested result or an in-progress checkpoint in `docs/architecture-logs/code-changes/` and update `CURRENT.md`. Keep unrelated uncommitted work intact. After testing a feature, ask the user which reusable rule, if any, to add to the skill; record approved rule changes in `docs/architecture-logs/rule-updates/`.
