# Architecture guidelines

Load relevant sections only: Responsibilities, Contracts, Errors, Transactions, Persistence (including Schema and seeds, Metadata migrations), UI data, Environments. These are defaults; project-adopted boundaries and exceptions take precedence.

## Responsibilities

Map responsibilities to the framework without mandatory folders or pass-through files. For layered APIs:

| Owner | Responsibility | Dependencies |
| --- | --- | --- |
| Route | URL, method, ordered middleware, handler binding | Transport middleware/controllers |
| Validator/middleware | Input shape, bounds, parsing, authentication, transport checks | Pure validation and auth infrastructure |
| Controller | HTTP input/output and serialization | Service operations and HTTP helpers |
| Service | Policy, stored-fact authorization, orchestration, transaction boundary | Repositories/models, adapters, domain operations |
| Model/repository | Parameterized persistence and row mapping | Database/transaction context |
| Adapter | Provider/storage I/O and provider translation | SDK, network, storage |

Do not reverse dependencies or create cycles. Infrastructure supports these owners without accumulating feature policy. Use clear named inputs; separate execution context when useful. Authentication establishes the actor; client-supplied owner IDs cannot replace it. Coarse role gates can run at transport boundaries; stored ownership/state decisions belong in services, with sensitive writes scoped by owner/state where appropriate. Parse inputs before consumers need them.

Generic utilities are pure reusable conversions. Keep business helpers with policy and effectful shared code with adapters/infrastructure. Adopt existing class/function and filename conventions instead of imposing a universal style.

## Contracts

Map database/provider names at boundaries into explicit domain shapes. Parameterize values and allow-list dynamic SQL identifiers. Preserve public fields, status codes, routes, authorization, envelopes, and resource identifiers unless an authorized coordinated migration changes them. Validate bounded pagination and inspect driver-specific binding requirements; clients page within endpoint limits. Do not generalize a single project's driver workaround.

Trace immediate consumers and affected client calls. Add meaningful boundary verification for migrated contracts; an internal rename is not permission to change deployed schema or JSON keys.

## Errors

Use stable types/codes, explicitly safe public messages, and retained internal causes. Do not classify by message text or assume any thrown message is public. Unexpected HTTP failures receive a safe generic response. Format responses once at the owning HTTP boundary; services do not write HTTP responses.

Inspect the installed framework/version's async behavior and existing wrappers. Ensure rejected promises reach the boundary without duplicate forwarding. For Express, delegate to the next error handler when headers have already been sent; do not attempt another JSON response. Streams need stream lifecycle/error cleanup; workers need job failure/retry handling rather than an HTTP wrapper.

Log once at the owning boundary with correlation and redaction. Retain enough internal context to diagnose without exposing credentials, sensitive payloads, SQL details, provider bodies, or private paths in public responses or logs. Verify relevant async rejection, expected/unexpected failure, redaction, and started-response cases.

## Transactions

The policy owner defines the unit of work. Every operation in it uses one transaction connection/context, including consistent reads; never silently fall back to a pool. Commit only after required conditions and writes succeed. Roll back on failure and release resources in cleanup, including failed commits or rollback attempts; retain the primary cause.

Protect concurrent invariants with database constraints, conditional updates, or locks, checking affected rows. A read then unconditional write is insufficient. Avoid slow provider calls inside transactions. Required external side effects need durable handoff or explicit recovery; database rollback cannot undo another system. Where retries occur, define idempotency, duplicate handling, retryable failures, and bounded retries. Verify affected rollback, cleanup, concurrent requests, and recovery paths.

## Persistence

Inspect the actual schema, mappings, migration state, and supported tooling before proposing a change. A script's existence does not establish verified operation. Do not edit live data as a side effect of architectural cleanup.

### Schema and seeds

Separate canonical schema, reviewed production presets, and development fixtures. Order dependencies and retain historical migrations. Canonical definitions describe new storage; live changes require reviewed migrations and verified backups. Never reset/reseed production during ordinary deployment. Initialize development data only on new empty storage, retaining it across restarts. Concrete SQL layout, seed ownership, reset procedures, and verified/pending tooling belong to the project.

### Metadata migrations

Stage schema/writers, legacy backfill, client compatibility, then metadata-only reads. Preserve public identifiers and guard new allocation until legacy IDs are indexed. Audit missing/unreferenced resources and provide interrupted-write recovery before cutover. Project guides own resource paths, tables, switches, and rollout gates.

## UI data

API clients own HTTP transport and boundary mapping. Query hooks, framework loaders, or the adopted data layer own server-state caching, invalidation, and refresh. Components/UI hooks own presentation and local UI state. Reuse the framework's data ownership; do not add a competing cache. Inspect loading, empty, error, and mutation refresh behavior when changing data flows. A styling edit does not require backend or database guidance unless it changes those contracts.

## Environments

Align configuration contracts and examples while preserving intentional environment differences. Keep secrets server-side; React build variables are public. Validate affected Compose configuration without printing resolved secrets, using quiet validation where supported. Check affected scripts and environment examples. Distinguish persistent development and production storage, and put service names, commands, backups, reset and deployment procedures in the project's deployment guide.
