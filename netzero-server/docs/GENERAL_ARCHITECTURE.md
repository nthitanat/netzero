# NetZero General Architecture

**Status:** Target architecture and migration guide. It is not a claim that every current endpoint already follows these rules.
**Last reviewed:** September 24, 2026
**Scope:** `netzero-server` and the equivalent backend boundaries in `netzero-chat-server`. The React client has its own component architecture; its API contract is part of this guide.

## 1. Purpose and system map

NetZero has a React client, a main Express API, a separate Express chat and product-survey API, and MySQL databases. The main API serves users, events, event participation, products, event products, reservations, surveys, chat applications, and Glocal check-ins. The chat API serves conversations and AI product-survey evaluation. The client calls both APIs.

```
netzero-client/src/api/*
      | HTTP
      +--------------------------+
      |                          |
      v                          v
netzero-server              netzero-chat-server
routes                      routes
  -> middleware               -> middleware
  -> controllers              -> controllers
  -> services                 -> services
  -> models / adapters        -> models / adapters
  -> MySQL / files / APIs     -> MySQL / AI provider
```

Within **each backend**, use this request path:

```
HTTP request
  -> route (method, path, ordered middleware)
  -> middleware (authentication, coarse authorization, input validation, upload/webhook transport)
  -> controller (HTTP input/output)
  -> service (business rules, orchestration, transaction ownership)
  -> model (database access and row mapping)
  -> MySQL
```

An external API client or file-storage adapter is another dependency of a **service**, not a model. The service coordinates it with model calls. No layer may skip the service to place business rules in a controller or route. **Utilities are shared helpers, not another request-processing layer.** Cross-cutting infrastructure such as logging, configuration, database pooling, and error handling supports these layers without becoming a place for feature logic.

### Non-negotiable rules

1. **Single responsibility:** each layer owns the work listed below.
2. **Dependency direction:** routes call middleware/controllers; controllers call services; services call models and external adapters; models call the database. Do not import controllers into services, or services into models.
3. **Object passing:** pass one named input object and, when needed, a separate execution context (for example a transaction). Do not grow long positional-argument lists.
4. **Case boundary:** use camelCase inside controllers/services and in new public contracts. Map to the database's actual column names in models. Existing `/api/v1` fields remain compatible until a deliberate versioned migration.
5. **Error propagation:** services throw typed application errors; controllers forward errors; one error handler formats HTTP responses. Do not infer status codes from error-message text.
6. **Transaction ownership:** the service defines the unit of work. Every database operation in that unit uses the same connection. Models execute SQL but do not independently commit a business workflow.
7. **Utility boundary:** shared utilities are small, pure, reusable functions. A `utils/` filename does not permit business decisions, SQL, HTTP, filesystem writes, or provider calls.
8. **Function-based target:** new and fully migrated application modules export functions or factory functions; do not declare application classes. Existing classes are a migration state, not the target style.
9. **No hidden implementation claim:** examples in this document are target patterns. Check the migration status below before assuming a named file or helper exists.
10. **Pagination contract:** validate `limit` as a positive integer and `offset` as a nonnegative integer, and enforce the endpoint's maximum page size. In the current mysql2/MySQL setup, keep `LIMIT ? OFFSET ?` parameterized but bind those validated values as decimal strings (`String(limit)`, `String(offset)`); binding JavaScript numbers causes `ER_WRONG_ARGUMENTS`. Clients that need a full collection must request successive pages within the limit, not send an oversized `limit`.

## 2. Responsibilities and allowed dependencies

| Layer | Owns | Must not own | May depend on |
| --- | --- | --- | --- |
| Routes | URL, method, middleware order, controller binding | Business decisions, SQL, response construction | Middleware, validators, controllers |
| Middleware | Authentication, role gates, request parsing/validation, rate limits, webhook authentication, upload transport | Multi-step business workflows, database mutations | Shared auth/config helpers; a narrowly scoped read dependency only when unavoidable |
| Validators | Request shape, types, limits, allowed values; cross-field input rules | Database existence/ownership checks | Validation library and pure helpers |
| Controllers | Read validated HTTP input and actor, call one service operation, select status/headers, serialize response | SQL, stock/ownership rules, transactions, provider calls | Services, response/error helpers |
| Services | Business rules, data-dependent authorization, orchestration across models/adapters, transaction boundary | `req`, `res`, HTTP response writing, raw SQL | Models, transaction helper, external adapters, domain helpers |
| Models | Parameterized SQL, persistence, row-to-domain mapping, database-level conditional updates | HTTP, provider calls, cross-resource policy | Database connection/transaction context |
| Adapters | SurveyMonkey/AI calls, binary file storage, provider-specific translation | HTTP response formatting, core domain decisions | Provider SDK/API or storage backend |
| Utilities | Pure formatting, parsing, and conversion reused across features | Business workflows, database/network/file I/O, Express request/response handling | Built-in language APIs and other pure utilities |

A service may call another service only when it represents a distinct reusable operation and does not create a dependency cycle. Prefer one orchestration service for a workflow that spans several models.

### Authentication versus authorization

- Authentication middleware verifies a JWT or webhook credential and attaches a consistent actor identity. Normalize legacy `req.user.id` versus `req.user.userId` at this boundary.
- Role middleware may reject a request based only on the authenticated role (for example, an admin-only route).
- A service must make the final decision when access depends on stored ownership, reservation state, event association, or another business fact. A model should also scope sensitive writes by the relevant owner/status when possible.
- Validate/parse parameters before middleware that reads them. Never rely on client-supplied `user_id` to identify the acting user.

## 3. Repository layout and naming

Keep existing public paths and existing route/controller/model names during migration. Add layers beside them. A target main-API resource looks like this:

```text
netzero-server/
  server.js                         # Express setup and route mounts only
  src/
    routes/productRoutes.js         # existing naming style
    middleware/auth.js              # shared transport concerns
    middleware/errorHandler.js
    validators/productValidator.js # target: request schemas
    controllers/ProductController.js
    services/ProductService.js      # target: business operations
    models/Product.js
    adapters/                      # target: external services/file storage
    utils/                         # target: pure shared helpers only
    config/database.js              # pool and transaction helper
    config/env.js
  sql/                              # schema migrations and setup scripts
```

Use the same structure in `netzero-chat-server` where applicable. Its existing `src/services/AiProductSurveyService.js` is an example of the intended service location, though any direct SQL in that service should move into models. Existing PascalCase filenames such as `ProductController.js` may export functions after migration; a filename does not require a class.

For **new resources**, choose one singular feature stem and use it across files. This matches the repository's current per-layer casing while giving new files a predictable name:

| Layer | Filename pattern | Product example |
| --- | --- | --- |
| Route | `routes/<feature>Routes.js` | `routes/productRoutes.js` |
| Validator | `validators/<feature>Validator.js` | `validators/productValidator.js` |
| Controller | `controllers/<Feature>Controller.js` | `controllers/ProductController.js` |
| Service | `services/<Feature>Service.js` | `services/ProductService.js` |
| Model | `models/<Feature>.js` | `models/Product.js` |
| Adapter | `adapters/<provider>Client.js` or a specific storage name | `adapters/surveyMonkeyClient.js` |
| Pure utility | `utils/<purpose>.js` | `utils/caseConverter.js` |

`<feature>` is lowerCamelCase and `<Feature>` is PascalCase; for example, `eventProduct` and `EventProduct`. Keep existing filenames such as `reservationRoutes.js` and `ProductReservationController.js` while migrating behavior so imports remain stable. Record a naming exception rather than renaming one side of a resource without its callers. File naming is separate from the functional export pattern and from the public URL.

Main API route groups currently mounted in `netzero-server/server.js` are `events`, `connection`, `auth`, `users`, `user-events`, `event-products`, `products`, `reservations`, `chatapps`, `surveys`, and `glocal`. The chat server mounts `chat` and product-survey routes. Do not copy country, institution, research-network, email-verification, or ASEM internal API examples from the previous document; they are not NetZero resources.

## 4. Request lifecycle

For a protected JSON write:

1. Global security, CORS, rate limiting, request ID, logging, and body parsing run in `server.js`.
2. The route applies authentication, coarse role checks, parameter/body validation, then the controller. If a role check needs a parsed parameter, validation comes first.
3. The controller constructs one input object from validated values and the authenticated actor. It does not spread business decisions across HTTP handlers.
4. The service loads required records, checks domain rules and data-dependent permission, owns a transaction if multiple writes must succeed together, and returns a domain result.
5. Models run parameterized SQL using the supplied transaction context and return mapped domain objects.
6. The controller selects status/headers and formats the response. An error goes to the central error handler.

A public read omits authentication only when its route is intentionally public. A webhook uses its dedicated credential check instead of JWT. A multipart upload adds upload parsing after authentication and before the controller; the service still authorizes the resource and coordinates metadata/storage.

### Target route/controller/service/model sketch

The following illustrates responsibilities; `validate`, `withTransaction`, and the service methods are **proposed interfaces**, not existing NetZero functions.

```js
// routes/reservationRoutes.js
router.post('/',
  authenticateToken,
  validate(createReservationSchema),
  asyncHandler(ProductReservationController.createReservation)
);

// controllers/ProductReservationController.js
async function createReservation(req, res) {
  const reservation = await ReservationService.createReservation({
    actor: req.user,
    data: req.body
  });
  return successResponse(res, reservation, 'Reservation created', 201);
}
module.exports = { createReservation };

// services/ReservationService.js
async function createReservation({ actor, data }) {
  return withTransaction(async (tx) => {
    const product = await Product.findById(data.productId, { tx });
    assertReservable({ actor, product, data });
    return ProductReservation.insert({
      ...data,
      userId: actor.userId,
      status: 'pending'
    }, { tx });
  });
}
module.exports = { createReservation };

// models/ProductReservation.js
async function insert(reservation, { tx }) {
  // Parameterized SQL only; map camelCase fields to the current schema.
  const [result] = await tx.execute(SQL_INSERT_RESERVATION, valuesForInsert(reservation));
  return findById(result.insertId, { tx });
}
async function findById(reservationId, { tx }) {
  const [rows] = await tx.execute(SQL_SELECT_RESERVATION, [reservationId]);
  return rows[0] ? mapReservation(rows[0]) : null;
}
module.exports = { insert, findById };
```

In a real implementation, use the transaction only when required by the complete workflow, and keep a consistent connection in every model call inside it. This sketch does not prescribe when stock is deducted; preserve the established reservation/confirmation semantics until that workflow is explicitly redesigned.

### Standard resource coding pattern

Use one predictable **class-free** pattern for each resource that is added or fully migrated. Export named functions from stateless controllers, services, and models. Node's module boundary already groups related functions, and Express consumes handler functions. When a component needs configuration or injected dependencies, export a factory function that returns an object of functions and closes over those dependencies. Do not keep per-request actor, transaction, or mutable workflow state in a shared module or factory instance.

NetZero's existing controllers, models, and one chat service include classes. They may remain during incremental migration so existing imports and behavior keep working. The target after migration is function modules across all application-owned backend code; do not add new `class` declarations or convert a working class solely for style while its resource still needs substantive migration. This is a coding convention, not a claim that every function is pure: models and adapters necessarily perform I/O, while reusable business calculations should be pure where practical.

```js
// services/ProductService.js: injected dependencies without an application class
function createProductService({ productModel, makeNotFoundError }) {
  async function getProductById({ productId }) {
    const product = await productModel.findById(productId);
    if (!product) throw makeNotFoundError('Product not found');
    return product;
  }

  return { getProductById };
}
module.exports = { createProductService };
```

| File | Standard shape | Method-name examples |
| --- | --- | --- |
| `routes/productRoutes.js` | One router; compose middleware and bind a controller method | `router.post('/', ..., ProductController.createProduct)` |
| `validators/productValidator.js` | Export named schemas for `body`, `params`, and `query` | `createProductSchema`, `updateProductSchema`, `productIdParamSchema` |
| `controllers/ProductController.js` | Export named HTTP handler functions; one service call per action | `createProduct`, `getProductById`, `listProducts`, `updateProduct`, `deleteProduct` |
| `services/ProductService.js` | Export named domain operation functions; inject dependencies only when useful | `createProduct`, `getProductById`, `listProducts`, `updateProduct`, `deleteProduct` |
| `models/Product.js` | Export named database functions | `insert`, `findById`, `findAll`, `count`, `updateById`, `deleteById` |

For each operation, use this sequence:

1. **Route:** apply authentication, role gate, parameter/body/query validation, then `asyncHandler(controllerMethod)` in that order. Keep specific paths before `/:id`.
2. **Controller:** read validated inputs and actor, call the matching service operation with one named object, and format one success response. Do not repeat request validation or catch an error only to call `next(error)`.
3. **Service:** check data-dependent permissions and domain state, coordinate model/adapter calls, own any transaction, and return a domain result. Throw a typed error for expected failures.
4. **Model:** issue parameterized SQL and map rows to domain fields. Return `null` for a missing single record and a collection for a list; leave the not-found decision to the service.
5. **Error middleware:** serialize failures once with the established `/api/v1` envelope. Preserve existing endpoint status and field names during migration.

| Operation | Service input | Service result |
| --- | --- | --- |
| Create | `{ actor, data }` | Created domain object |
| Get one | `{ actor, productId }` (omit `actor` for a fully public read) | Domain object or typed not-found error |
| List | `{ actor, filters, pagination }` | `{ items, total, limit, offset }` where pagination is supported |
| Update | `{ actor, productId, updates }` | Updated domain object |
| Delete | `{ actor, productId }` | Explicit deletion result; controller preserves the endpoint's current HTTP response |
| Domain action | `{ actor, reservationId, actionData }` | Updated domain object or an explicit outcome |

Use the same public operation names across controller and service so a request is easy to trace. Keep database verbs (`find`, `insert`, `update`, `delete`, `count`) in models. Name business actions for the actual transition, such as `confirmReservation`, `cancelEvent`, or `verifyCheckin`, instead of forcing every workflow into CRUD. A list service should return a consistent object such as `{ items, total, limit, offset }` when pagination is supported; the controller maps it to the endpoint's existing response shape. Avoid duplicate parsing, alternate response envelopes, and different error-handling styles for the same kind of endpoint.

## 5. Layer rules in detail

### Routes

Routes define endpoint paths, methods, middleware order, and controller handlers. They do not query MySQL, transform domain objects, or make policy decisions. Keep specific paths such as `/my`, `/recommended`, and `/statistics` before `/:id` routes. Put route registration in `server.js` until an intentional router-index change is made.

### Middleware and validators

Use middleware for transport-level concerns that apply before the controller. Prefer resource-specific validators in `src/validators/` for new/migrated endpoints. `express-validator` is already used in `netzero-server/src/middleware/validation.js`, and Joi is installed; choose one validation approach per migrated endpoint rather than duplicating rules in both middleware and controllers. A validator may check that `quantity` is a positive integer or `optionOfDelivery` is an allowed value. Whether a product exists, belongs to a seller, or has enough stock belongs in the service.

Authentication and validation failures may return immediately through centralized helpers. General exceptions go to the error handler. File size/type checks and webhook credential checks are middleware responsibilities. Do not place an external API request in a validator.

### Controllers

Controllers know HTTP and the API contract: `req.params`, `req.query`, `req.body`, `req.user`, status codes, headers, and response envelopes. They call services with a named object, then serialize the result. They do not import models, database utilities, filesystem APIs, or provider clients. Wrap asynchronous handlers once with `asyncHandler`; avoid repeated `try/catch` blocks whose only action is `next(error)`.

A controller can map a service result to the existing `/api/v1` response shape. Use one response helper for the established `success`, `message`, `data`, and `timestamp` envelope, and preserve endpoint-specific fields such as `count` or `total` where clients depend on them.

### Services

Services accept ordinary JavaScript values, not Express objects. They own domain validation after request-shape validation, status transitions, ownership, cross-model operations, provider orchestration, and transaction boundaries. They return results or throw typed errors such as validation, forbidden, not found, conflict, or external dependency failure. A service should not assign HTTP status codes throughout its business logic; the error layer maps error types to HTTP.

Examples of service ownership in NetZero:

- `ReservationService`: prevent self-reservation, apply delivery/event rules, check and update stock, confirm/cancel reservations, enforce seller/customer permissions.
- `EventService`: create an event and establish creator association as one consistent workflow.
- `EventProductService`: assign stock to events and enforce ownership/available quantity.
- `GlocalCheckinService`: normalize email, apply cache freshness policy, call SurveyMonkey, store/return verification state.
- `SurveyService`: create/update surveys and questions, submit responses, compute analytics policy.
- `AiProductSurveyService` in the chat server: coordinate evaluation and persistence; provider calls live behind an adapter and SQL in models.

### Models

Models own database access. Keep SQL parameterized; allow-list any dynamic column names or sort keys. Return predictable plain domain objects rather than raw driver tuples or record-class instances; use row-mapping functions for conversion. Queries used for public lists must support bounded pagination where the endpoint needs it. Models may expose atomic conditional operations such as `decrementStockIfAvailable`, which services compose into a business workflow. Models do not decide whether a user is allowed to reserve their own product or which HTTP status to send.

Avoid `SELECT *` when a query joins tables with overlapping column names; select/alias the fields needed by the domain result. Model methods that participate in a transaction must use the passed connection and must not silently fall back to the global pool.

### Utilities and specialized helpers

`src/utils/` is a **shared helper library**, not a place in the route → controller → service → model chain. A utility should take explicit values, return a value, and be safe to call without a database, network, filesystem, or Express request. Examples are date formatting, string normalization, ID parsing, and a pure case-conversion function. Any layer may import a suitable pure utility, but a utility must not import routes, controllers, services, or models. Keep a feature-specific policy next to its owning service rather than moving it to `utils/` merely to shorten a service file.

Choose location by behavior, even when an existing file is named `*Util`:

| Behavior | Location and rule |
| --- | --- |
| Pure field/case conversion | `utils/` is acceptable; call it at the model boundary, with explicit mappings for legacy mixed-case columns |
| HTTP response formatting or `asyncHandler` | HTTP/controller support, such as `middleware/errorHandler.js` or a response helper; usable by controllers, not services/models |
| Database pool, transaction wrapper, SQL execution | `config/database.js` or database infrastructure; SQL remains in models and transaction ownership in services |
| Logger and configuration | Cross-cutting infrastructure; may be imported where needed, with no feature decisions |
| SurveyMonkey, OpenAI, web search, or file-storage I/O | `adapters/`; called by a service, with credentials kept server-side |
| Reservation, event, check-in, or AI evaluation decisions | The owning service, even if implemented as a small helper function |

The main server currently has an empty `src/utils/` directory. In the chat server, `utils/openAiApiUtil.js`, `utils/simpleAiWebsearch.js`, and `utils/welcomeChat.js` perform provider calls or AI workflow work. During migration, classify their functions by the table above: provider transport belongs in an adapter and conversation/evaluation decisions belong in a service. Do not move files solely to satisfy a name; first separate any mixed responsibilities.

### Database and schema changes

`netzero-server/src/config/database.js` currently provides a MySQL pool plus `executeQuery`, `executeCommand`, and an operation-list `executeTransaction`. Some models still use `pool.execute()` directly, and some manage their own transaction. The target is one transaction helper that accepts a callback and passes one connection to every model call in a workflow. Keep connection release in `finally` and rollback on failure.

Schema definitions currently appear in model `getSchema()` methods and SQL files under `netzero-server/sql/`; `server.js` does not run a `tableSchemas.js` synchronizer. Treat versioned, reviewable SQL migrations as the source of schema changes. Do not add startup table creation merely because the old ASEM document described it. Align model mappings with the actual deployed schema before changing a column name.

## 6. Data contracts and naming

- **Internal JavaScript objects:** camelCase, for example `productId`, `stockQuantity`, `eventDate`, `firstName`.
- **Database:** use the deployed column name in SQL. New columns should use snake_case; existing columns include mixed names such as `firstName` and `isRecommend`, so do not assume a generic converter always works.
- **Model boundary:** explicitly map input and output fields for each resource, including JOIN aliases. The service must not know whether a column is named `product_id` or `isRecommend`.
- **Public API:** preserve the existing `/api/v1` contract. It currently mixes snake_case and camelCase; the React client reads fields such as `event_date`, `stock_quantity`, and `firstName`. Use a controller/serializer compatibility map during migration. Introduce a consistent camelCase contract only through an intentional client-coordinated, versioned change.
- **Object passing:** `service.create({ actor, data })`, `model.update(id, updates, { tx })`. IDs and transaction context may be separate where that makes the operation unambiguous; do not pass every field positionally.

### Variable and symbol naming convention

These rules apply to new code and to code moved during a resource migration. They describe **JavaScript names**, regardless of the physical database or legacy API field name.

| Kind | Rule | NetZero example |
| --- | --- | --- |
| Local variables, parameters, object properties | `camelCase`; use a domain noun that says what the value contains | `productId`, `reservationInput`, `stockQuantity`, `surveyResponse` |
| Booleans | Start with `is`, `has`, `can`, or `should`; name the condition, not a vague flag | `isRecommended`, `hasAvailableStock`, `canConfirmReservation` |
| IDs and collections | Use `<entity>Id` for one ID and a plural noun for a collection | `eventId`, `productIds`, `reservations` |
| Counts and amounts | Include the unit or subject when ambiguity is possible | `stockQuantity`, `reservedUnitPrice`, `timeoutMs`, `totalReservations` |
| Functions and methods | `camelCase`, normally a verb followed by the thing acted on | `createReservation`, `findProductById`, `formatEventDate` |
| Factory functions | `create` followed by the dependency being configured; return named operations | `createSurveyMonkeyClient`, `createReservationService` |
| Module-level fixed constants | `UPPER_SNAKE_CASE` when the value is a true fixed configuration/limit; ordinary immutable locals still use `camelCase` | `MAX_PAGE_SIZE`, `SURVEY_SYNC_TTL_MS`; `const productId` |
| Environment variables | `UPPER_SNAKE_CASE`; retain existing `DEV_`/`PROD_` prefixes | `DEV_DB_HOST`, `PROD_JWT_SECRET`, `MAX_FILE_SIZE` |
| SQL tables and new columns | `snake_case`; use the deployed name for existing mixed-case columns | `product_reservations`, `product_id`, existing `isRecommend` |
| Public JSON fields | Preserve each existing `/api/v1` spelling; use `camelCase` for a new versioned contract | existing `stock_quantity`, `event_date`, `firstName` |

Name a value for its meaning, not for its layer: prefer `productId` and `reservation` to `id`, `data`, or `result` when several entities are present. Avoid abbreviations such as `prod`, `resv`, or `qty` in public interfaces; established terms such as `id`, `url`, `api`, and `tx` are acceptable where clear. Use `actor` for the authenticated caller and `ownerId` or `customerId` for other roles; do not call every user `userId` when their roles differ. Functions do not need an `Async` suffix merely because they return a promise.

At each boundary, translate names once and keep the rest of that layer consistent. For example, a `/api/v1` controller may read `req.body.product_id`, pass `{ productId }` to a service, and receive a model object whose `productId` came from the SQL column `product_id`. Do not carry `product_id` through the service or return `productId` to a legacy client that expects `product_id`. A pure mapping helper may live in `utils/`, but the controller owns public-API mapping and the model owns database mapping.

Do not silently change JSON keys, response envelopes, routes, auth behavior, upload URLs, or status codes as a side effect of moving code between layers. Add contract tests at the boundary for migrated endpoints.

## 7. Error handling and responses

The target flow is `model/adapter throws -> service adds business context if useful -> async controller wrapper forwards -> one error handler serializes`. Use an application error with a stable code and safe message; a small error factory can attach that code to an `Error` without declaring a custom class. Retain the original cause for logs. Map known types to 400, 401, 403, 404, 409, 422, or 503 as appropriate. Return 500 for unexpected failures without leaking SQL, tokens, filesystem paths, or provider response bodies.

The current `errorHandler.js` classifies some plain errors by message substrings and controllers also construct their own error responses. Replace that pattern endpoint by endpoint with typed errors and a shared response helper while preserving client-visible behavior where required. Log once with the request ID and enough context to investigate; avoid dumping credentials or full sensitive request bodies.

## 8. Transactions and concurrency

A transaction is required when a business operation must succeed or fail as a unit. The service starts it, calls models with the same `tx`, and commits only after all database conditions and writes succeed. The service chooses when to perform an external call; do not hold a database transaction open during a slow SurveyMonkey or AI request. For a required side effect after commit, use a durable handoff or explicit recovery strategy rather than assuming a second system can join the MySQL transaction.

For reservations and event stock, a prior read followed by a later unconditional decrement can race under concurrent requests. Use a row lock or conditional `UPDATE ... WHERE stock_quantity >= ?` inside the same transaction, check affected rows, and keep reservation status changes in that transaction. `findById()` calls inside a transaction must use its connection if the read must be consistent with its writes. Add concurrent-request tests for this workflow when it is migrated.

A transaction helper that takes a fixed list of SQL operations is useful for simple batches, but a callback on one connection is needed for workflows that branch, inspect results, or use generated IDs. Models remain the only place that issues those SQL statements.

## 9. Uploads and external integrations

### Product and event images

The current API accepts images through Multer and stores files under `netzero-server/files/`; Docker mounts that directory. Routes apply authentication and upload parsing. The target service checks resource ownership, decides storage/metadata changes, and delegates file operations to a storage adapter and SQL to models. Handle a database failure after file upload by cleaning the staged file or recording a recoverable state. Preserve existing image URLs while migrating. If the API later runs on multiple hosts, move files to shared storage rather than relying on each host's local directory.

### SurveyMonkey and webhooks

`/api/v1/glocal/webhooks/surveymonkey` uses a dedicated webhook authentication middleware. Keep credential verification at the transport boundary. Move the current check-in freshness/normalization/provider orchestration from `GlocalController` into a service. The SurveyMonkey client is an adapter; it does not decide HTTP responses or persist check-ins on its own.

### Chat and AI

The chat server is a separate process with its own routes, controllers, models, and AI service. Apply the same layer rules there. A controller receives and returns HTTP data; a service decides how to build/evaluate the conversation or survey; a model stores and retrieves rows; an AI adapter handles provider-specific calls. Avoid having the chat server reach into main-server controllers or models through imports. If cross-service data is required, define an explicit, authenticated API contract and its failure behavior; no ASEM `/internal/v1` endpoint exists in NetZero today.

## 10. Adding or migrating a resource

1. Record the existing route, request and response fields, auth rules, database tables, and client callers.
2. Add/adjust schema migrations under `sql/` only when persistence needs to change.
3. Add a request validator for shape/types and a route middleware chain in the correct order.
4. Add model methods for parameterized queries and explicit row mapping. Include pagination and transaction-context support where needed.
5. Add a service for business rules, data-dependent authorization, cross-model operations, and transaction ownership.
6. Reduce the controller to HTTP input/output and one service call per operation.
7. Add shared response/error handling without changing the existing API contract unexpectedly.
8. Verify the client contract, authorization cases, failure paths, and any concurrency-sensitive transaction. Update this document if the boundary changes.

### Review checklist

- [ ] Route contains only middleware composition and controller binding.
- [ ] Migrated resource follows the standard route, validator, controller, service, and model pattern.
- [ ] New resource files use one feature stem and the per-layer filename patterns; legacy filename exceptions are explicit.
- [ ] New or fully migrated application code exports functions/factories without application `class` declarations.
- [ ] Input shape validation runs before controller; domain validation runs in service.
- [ ] Controller imports no model, DB helper, provider client, or filesystem module.
- [ ] Service imports no Express `req`/`res` and contains no raw SQL.
- [ ] Model contains parameterized SQL and explicit field mapping, not HTTP or business policy.
- [ ] A shared utility is pure; effectful or domain-specific work stays with its adapter or service.
- [ ] New JavaScript symbols use the variable naming convention; API and SQL names are mapped at their boundaries.
- [ ] All operations in one transaction use the same connection.
- [ ] Errors are typed and formatted once; responses retain the required `/api/v1` shape.
- [ ] Existing client fields and routes still work, or a coordinated versioned migration is provided.

## 11. Current migration status and priorities

| Area | Current code | Target work |
| --- | --- | --- |
| Main API | Route → controller → model is common; `src/services/` and `src/validators/` do not yet exist; controllers/models mostly use static classes | Add service/validator layers and move migrated resources to function modules without changing route URLs |
| Product and reservations | Controllers validate and apply business rules; reservation confirmation has a model-owned transaction | Move rules and transaction ownership to services; enforce stock atomically |
| Events and event products | Controllers and models share workflow/ownership concerns | Move creator association, event ownership, and stock assignment workflows to services |
| Glocal check-in | Controller handles cache policy and SurveyMonkey calls | Move orchestration to a service and keep provider access in an adapter |
| Chat server | Has class-based `AiProductSurveyService`, but some service code calls database helpers directly | Move SQL into models, keep AI provider details in an adapter, and use function modules/factories after migration |
| Utilities | Main-server `src/utils/` is empty; chat-server `src/utils/` contains provider and workflow code | Keep pure shared helpers in `utils/`; move I/O and policy to adapters/services |
| Field casing | `/api/v1` and deployed schema mix snake_case and camelCase | Use explicit boundary mapping; change public casing only with a coordinated version |
| Errors and responses | Central middleware exists alongside manual controller responses and message-based error classification | Adopt typed errors and shared serialization by endpoint |

Start with **reservations and event stock**, because their rules span records and depend on transaction correctness. Follow with events/event products and Glocal check-ins. Preserve the working HTTP contract throughout. This document is complete as a design guide; the code migration is separate work and should be reviewed resource by resource.
