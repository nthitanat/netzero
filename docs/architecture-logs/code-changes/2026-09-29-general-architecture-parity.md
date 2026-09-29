# General architecture ownership and parity

**Status:** Inventory completed before predecessor retirement. Scope is skill extraction and bounded adoption, not application migration.

| Original rule or requirement | Owning destination and parity evidence |
| --- | --- |
| Start/resume, inspect actual state | Project `AGENTS.md`; compact plan/architecture indexes; general entry point |
| Layer check and request-path inspection | Shared Responsibilities and entry point; NetZero guide §§2, 4–5 specifies adopted concrete boundaries |
| `/api/v1`, casing, envelopes, auth, paths | NetZero guide §§1, 6; shared Contracts supplies default compatibility principle |
| mysql2 decimal-string pagination, maximum, client paging | NetZero guide §1, rule 10 retained verbatim |
| Function modules, filename/symbol conventions, legacy exceptions | NetZero guide §§3–4, 6 retained as project decisions, not universal defaults |
| Errors, async/started responses, safe messages and redaction | Shared Errors; NetZero guide §7 retains envelope/current implementation specifics |
| Transaction context, rollback/cleanup, concurrency, side effects/retries | Shared Transactions; NetZero guide §8 gives stock-specific invariants |
| Metadata staging, backfill, ID allocation, orphan audit/recovery | Shared Persistence → Metadata migrations; NetZero guide §9 retains adopted resource cutover |
| `product_images`/`event_images`, batch/indexed reads, null/404, absolute URLs/gallery IDs, legacy switch | NetZero guide §9 retained verbatim; deployment guide Production preparation retains both rollout switch names |
| Per-table CREATE/INSERT, comment-only empty preset file, ordering, historical SQL, fixtures | NetZero guide §5 retained verbatim; exact paths remain in seed README and seeding plan |
| Dedicated persistent development volume; new-empty initialization; reset effects | Deployment guide Development retained unchanged; architecture guide §5 retains data lifecycle |
| Reviewed live migrations, verified backup, never ordinary-deploy reset | Shared Persistence; deployment guide Production preparation and On-premises backups retain commands/gates |
| Compose environment names, host paths, scripts, backup destination | Deployment guide retained byte-for-byte; no deployment/config edits |
| Pending seed export, reset/restart/sync, missing image runbook, production backup | Compact architecture index retains all blockers and relevant historical logs |
| Rewrite in place, rule-promotion authorization, plan/log locations | Project `AGENTS.md`; shared Maintenance owns general promotion/release procedure |
| React transport, framework-owned cache, UI state | Shared UI data; no additional caching framework imposed on NetZero |
| Portable releases, dual homes, differing project pins, rollback | Shared Maintenance and `scripts/release.py`; tests in `tests/skills/test_general_architecture_release.py` |

## Evidence and limitations

Read both original guides and the installed predecessor entry point, repository instructions/indexes, server/client manifests, and sampled product route/controller/service, event controller/service, reservation service, Glocal controller/service, chat AI service, and database transaction helper. Used directory inventory for validators/services. Excluded dependencies, private environment contents, production data, and unrelated application internals. No repository-wide implementation compliance claim.

Corrected stale guide claims that services/validators and callback transactions did not exist, and that sampled Glocal/chat work still had the old ownership/style. Kept target rules and marked unsampled compliance as requiring inspection. Deployment guide and sensitive project-specific pagination/image/seed rules were preserved. Existing working-tree modifications remain intact.

The package is stored at `skills/general-architecture/`, outside workflow Markdown folders because it is the explicitly specified portable skill deliverable. Its release instructions need no NetZero paths. Detailed adoption/installation evidence belongs in the completion log, not routine feature loading.
