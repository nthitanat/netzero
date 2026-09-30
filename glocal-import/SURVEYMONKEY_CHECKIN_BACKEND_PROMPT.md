# Backend Task: SurveyMonkey Check-In Feature

## Overview

Add a `survey_checkins` resource + SurveyMonkey integration to this server project. A frontend `/check-in` page will let a user enter their email; the backend must tell it whether that email has already **completed** a specific SurveyMonkey survey, and if not, return a redirect URL to the survey (pre-filled with their email via a SurveyMonkey **custom variable**).

**Follow this project's existing layered architecture exactly** (routes → middleware → validators → controllers → services → models → DB). Do not deviate from established naming/response/error conventions — mirror whatever an existing resource (e.g. `user` or `product`) does in this codebase. If any instruction below conflicts with an existing project convention, **the project convention wins** — this file describes the target behavior, not a license to introduce a new style.

All SurveyMonkey API calls and the SurveyMonkey access token live **only** in this backend. The frontend never talks to SurveyMonkey directly and never sees the token.

---

## 1. Why server-side only (do not skip this)

- The SurveyMonkey access token is a secret. It must never be sent to or bundled in the frontend.
- SurveyMonkey does not support unauthenticated/browser-CORS access with a bearer token — this has to be server-to-server.
- We need our own DB cache to avoid SurveyMonkey's rate limits (private/draft apps: **120 requests/minute, 500 requests/day** starting tier).
- The webhook receiver must be a public server endpoint.

---

## 2. Environment variables to add

Add to whatever env file this project already uses (`.env.development` / `.env.production`, per its `env.config.js` pattern) — **not** the React app's `.env`:

```
SURVEYMONKEY_ACCESS_TOKEN=          # Bearer token for api.surveymonkey.com/v3
SURVEYMONKEY_SURVEY_ID=             # The survey to check completion against
SURVEYMONKEY_SURVEY_REDIRECT_URL=   # e.g. https://www.surveymonkey.com/r/XXXXXXX
SURVEYMONKEY_WEBHOOK_SECRET=        # Shared secret SurveyMonkey sends back in the webhook's Authorization header
```

If this project has a `config/` folder with per-feature config files (e.g. `jwt.config.js`, `email.config.js`), add a `surveyMonkey.config.js` that reads these and exports them, consumed by the new SurveyMonkey client util. Follow the same pattern as other `*.config.js` files in this repo.

---

## 3. Database table

Add to the project's table-definition file (e.g. `tableSchemas.js` if it uses declarative schema + auto-sync — **do not hand-write raw `CREATE TABLE` SQL** if the project has this pattern):

```javascript
survey_checkins: {
  tableName: 'survey_checkins',
  columns: {
    id:                          { type: 'INT', primaryKey: true, autoIncrement: true, nullable: false },
    survey_id:                   { type: 'VARCHAR(64)', nullable: false },
    identifier_type:             { type: "ENUM('email')", nullable: false, default: "'email'" },
    identifier_value:            { type: 'VARCHAR(255)', nullable: false }, // normalized: trimmed + lowercased email
    surveymonkey_response_id:    { type: 'VARCHAR(64)', nullable: true },
    status:                      { type: "ENUM('not_started','partial','completed')", nullable: false, default: "'not_started'" },
    checked_in_at:               { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false },
    completed_at:                { type: 'TIMESTAMP', nullable: true, default: 'NULL' },
    last_synced_at:              { type: 'TIMESTAMP', nullable: true, default: 'NULL' },
    created_at:                  { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP', nullable: false },
    updated_at:                  { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', nullable: false }
  },
  indexes: [
    { name: 'uq_survey_identifier', columns: ['survey_id', 'identifier_type', 'identifier_value'], unique: true },
    { name: 'idx_status', columns: ['status'] }
  ]
}
```

Adjust column/type syntax to match whatever this project's schema DSL actually looks like — the shape above (snake_case columns, unique compound index on `survey_id + identifier_type + identifier_value`) is the important part, not the exact syntax.

---

## 4. SurveyMonkey client util (new integration module)

Create `surveyMonkey.client.js` (place wherever this project keeps third-party API integrations — e.g. alongside other `*.util.js` files, or a new `integrations/` folder if that pattern already exists). Responsibilities:

- An HTTP client (axios or whatever this project already uses elsewhere) pointed at `https://api.surveymonkey.com/v3`, with header `Authorization: Bearer ${SURVEYMONKEY_ACCESS_TOKEN}`.
- `findResponseByEmail(surveyId, normalizedEmail)`:
  - `GET /surveys/{surveyId}/responses?custom_variables='email'%3D'{normalizedEmail}'`
  - Return the first matching response's `id` and status info (may require a follow-up call to `GET /surveys/{surveyId}/responses/{responseId}` for `response_status`, since the list endpoint's documented example schema is minimal — verify at implementation time what fields the list actually returns and fetch the individual response if `response_status` isn't present in the list payload).
  - Map SurveyMonkey's `response_status` (`completed | overquota | disqualified`) to our local `status` enum: `completed → completed`, anything else present but not completed → `partial`, no response found → `not_started`.
- `getResponse(surveyId, responseId)`:
  - `GET /surveys/{surveyId}/responses/{responseId}` — used by the webhook handler to read `custom_variables.email`, since the webhook payload itself only contains resource IDs, not the email.
- Respect `X-Ratelimit-*` response headers if this project has a pattern for logging/monitoring upstream rate limits; otherwise just handle `429` by throwing a distinguishable error the service layer can catch and gracefully degrade on (fall back to cached DB row instead of failing the request).
- Do not log full email addresses or the access token in plaintext logs — mask/redact per this project's logging conventions (check `logger.util.js` or equivalent for existing redaction helpers before adding new logging).

---

## 5. Model (`surveyCheckin.model.js`)

Standard CRUD + one lookup + one upsert, following this project's existing model conventions (snake_case SQL, `toCamelCase`/`toSnakeCase` conversion at the model boundary if that utility exists here):

- `createCheckin(data)`
- `findCheckinById(id)`
- `findByIdentifier(surveyId, identifierValue)` — the core lookup used by the verify flow
- `upsertCheckin(data)` — `INSERT ... ON DUPLICATE KEY UPDATE` (or equivalent) keyed on `(survey_id, identifier_type, identifier_value)`
- `listCheckins(filters, page, limit)` — filter by `surveyId`, `status`, date range
- `countCheckins(filters)`
- `updateCheckin(id, updates)`
- `deleteCheckin(id)` — hard delete is fine here (no soft-delete requirement for this resource unless the project's convention mandates soft delete on everything, in which case follow that convention)

---

## 6. Validator (`surveyCheckin.validator.js`)

Using whatever validation library this project already uses (e.g. Joi), camelCase fields:

- `verifyCheckinSchema`: `{ email: <required, valid email string> }`
- `createCheckinSchema`: `{ surveyId, identifierValue (email), status (optional enum) }`
- `updateCheckinSchema`: `{ status (optional enum), surveymonkeyResponseId (optional) }` — at least one field required
- `checkinIdParamSchema`: `{ id: <required positive integer> }`
- `listCheckinsQuerySchema`: `{ page, limit, surveyId (optional), status (optional enum) }`

---

## 7. Service (`surveyCheckin.service.js`)

This holds the actual logic — no HTTP concerns, throw descriptive errors per this project's error-handling convention.

```
verifyCheckin({ email }):
  normalizedEmail = normalize(email)          // trim + lowercase
  surveyId = config.SURVEYMONKEY_SURVEY_ID
  row = model.findByIdentifier(surveyId, normalizedEmail)

  if row && row.status === 'completed':
    return { completed: true }

  if row && row.lastSyncedAt is within TTL (e.g. 60s):
    return buildResult(row)   // avoid re-querying SurveyMonkey too frequently

  smResult = surveyMonkeyClient.findResponseByEmail(surveyId, normalizedEmail)
  // on SurveyMonkey error/timeout/429: log it, fall back to `row` if it exists,
  // otherwise treat as not_started but do NOT overwrite any existing cached row

  upserted = model.upsertCheckin({
    surveyId, identifierType: 'email', identifierValue: normalizedEmail,
    status: smResult.status, surveymonkeyResponseId: smResult.responseId,
    completedAt: smResult.status === 'completed' ? now() : row?.completedAt ?? null,
    lastSyncedAt: now()
  })

  return buildResult(upserted)

buildResult(row):
  if row.status === 'completed': return { completed: true }
  redirectUrl = `${config.SURVEYMONKEY_SURVEY_REDIRECT_URL}?email=${encodeURIComponent(row.identifierValue)}`
  return { completed: false, redirectUrl }

handleWebhookEvent(payload):
  // Verify payload.event_type === 'response_completed' before doing anything
  { survey_id, response_id } = payload.resources
  response = surveyMonkeyClient.getResponse(survey_id, response_id)
  normalizedEmail = normalize(response.customVariables?.email)
  if !normalizedEmail: log + return (nothing to key on)
  model.upsertCheckin({
    surveyId: survey_id, identifierType: 'email', identifierValue: normalizedEmail,
    status: 'completed', surveymonkeyResponseId: response_id,
    completedAt: now(), lastSyncedAt: now()
  })

// Plain admin CRUD wrappers around the model:
listCheckins(filters, page, limit)
getCheckinById(id)
createCheckin(data)
updateCheckin(id, updates)
deleteCheckin(id)
```

---

## 8. Controller (`surveyCheckin.controller.js`)

Thin HTTP layer only — mirror this project's existing controller pattern exactly (`asyncHandler` wrapper, `successResponse`/`paginatedResponse` utils, parse `req.params`/`req.query`, pass whole `req.body` to services):

- `verifyCheckin` — `POST /survey-checkins/verify`
- `listCheckins` — `GET /survey-checkins`
- `getCheckinById` — `GET /survey-checkins/:id`
- `createCheckin` — `POST /survey-checkins`
- `updateCheckin` — `PATCH /survey-checkins/:id`
- `deleteCheckin` — `DELETE /survey-checkins/:id`
- `receiveWebhook` — `POST /webhooks/surveymonkey` (note: this one should NOT use the standard success envelope if SurveyMonkey expects a plain `200 OK`/specific ack format — check SurveyMonkey's webhook docs for the expected response before wrapping it in this project's usual response format)

---

## 9. Routes (`surveyCheckin.routes.js` + webhook route)

Mirror this project's existing route file conventions for middleware ordering (rate limit → auth → role → validate → controller):

```javascript
// Public-ish, used by the frontend /check-in page — no JWT (anonymous check-in),
// but DO apply this project's general API rate limiter (or a new dedicated one)
// since this is an unauthenticated, externally-triggered endpoint.
router.post(
  '/verify',
  /* rate limiter, if this project has one for public endpoints */
  validate(verifyCheckinSchema),
  surveyCheckinController.verifyCheckin
);

// Admin-only CRUD — reuse existing authenticateToken + requireRole(['admin'])
router.get('/', authenticateToken, requireRole(['admin']), validate(listCheckinsQuerySchema, 'query'), surveyCheckinController.listCheckins);
router.get('/:id', authenticateToken, requireRole(['admin']), validate(checkinIdParamSchema, 'params'), surveyCheckinController.getCheckinById);
router.post('/', authenticateToken, requireRole(['admin']), validate(createCheckinSchema), surveyCheckinController.createCheckin);
router.patch('/:id', authenticateToken, requireRole(['admin']), validate(checkinIdParamSchema, 'params'), validate(updateCheckinSchema), surveyCheckinController.updateCheckin);
router.delete('/:id', authenticateToken, requireRole(['admin']), validate(checkinIdParamSchema, 'params'), surveyCheckinController.deleteCheckin);

module.exports = router;
```

**Webhook route** — if this project already has an "internal" or "external service" route prefix pattern (e.g. `/internal/v1/*` with a shared-secret header check), follow that same shape but for an *inbound* external webhook instead:

```javascript
// src/middleware or wherever auth middleware lives:
const authenticateSurveyMonkeyWebhook = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== process.env.SURVEYMONKEY_WEBHOOK_SECRET) {
    return errorResponse(res, 'Invalid webhook signature', 401, 'UNAUTHORIZED');
  }
  next();
};

// routes/webhooks.routes.js
router.post('/surveymonkey', authenticateSurveyMonkeyWebhook, surveyCheckinController.receiveWebhook);
```

Register both route files in this project's central router (`routes/index.js` or equivalent):
```javascript
router.use('/survey-checkins', surveyCheckinRoutes);
router.use('/webhooks', webhookRoutes);
```

---

## 10. One-time SurveyMonkey setup (not application code — a manual/ops step)

Document this for whoever configures the SurveyMonkey account (can be a short script or just manual dashboard steps):

1. Define a custom variable named `email` on the target survey (`custom_variables` field on the survey resource, or via the survey builder UI).
2. Create the webhook: `POST /webhooks` with `event_type: "response_completed"`, `object_type: "survey"`, `object_ids: [SURVEYMONKEY_SURVEY_ID]`, `subscription_url: "https://<this-backend-host>/webhooks/surveymonkey"`, `authorization: SURVEYMONKEY_WEBHOOK_SECRET`.
3. Make sure every link to the survey (from the `/check-in` redirect, QR codes, etc.) appends `?email=<value>` so responses get tagged with the custom variable.

---

## 11. Testing checklist

- [ ] `POST /survey-checkins/verify` with an email that has no prior response → `{ completed: false, redirectUrl }`, and a `not_started` row is created in the DB.
- [ ] `POST /survey-checkins/verify` again immediately with the same email → served from cache (no duplicate SurveyMonkey call within TTL).
- [ ] Simulate a `response_completed` webhook payload → row updated to `completed`, `completedAt` set.
- [ ] `POST /survey-checkins/verify` with that now-completed email → `{ completed: true }`, no redirect.
- [ ] SurveyMonkey call failure/timeout → falls back to cached row instead of 500ing the whole request.
- [ ] Admin CRUD routes reject non-admin/unauthenticated requests.
- [ ] Webhook route rejects requests with missing/incorrect `Authorization` header.
- [ ] Email normalization (trim + lowercase) applied consistently on write and read paths.
- [ ] No SurveyMonkey token or full email addresses appear in server logs.
