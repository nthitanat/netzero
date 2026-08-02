# Glocal Check-In API Client Integration

This document is for another client-side project or AI agent integrating with the NetZero Glocal SurveyMonkey check-in API.

## Production Base URL

Use this base URL for production:

```txt
https://engagement.chula.ac.th/netzero-api/api/v1
```

Example full public endpoint:

```txt
https://engagement.chula.ac.th/netzero-api/api/v1/glocal/survey-checkins/verify
```

All request and response bodies are JSON unless noted otherwise.

## Route Protection Summary

The API is intentionally split into public guest routes and protected admin routes.

Public guest route:

```txt
POST /glocal/survey-checkins/verify
```

Admin-only routes:

```txt
GET    /glocal/survey-checkins
GET    /glocal/survey-checkins/:id
POST   /glocal/survey-checkins
PATCH  /glocal/survey-checkins/:id
DELETE /glocal/survey-checkins/:id
```

Webhook route:

```txt
POST /glocal/webhooks/surveymonkey
```

The webhook route is not for browser clients. It is authenticated with a SurveyMonkey shared secret.

## Guest Check-In Flow

Use this route from the public client-side check-in page. It does not require a JWT.

### Verify Check-In

```http
POST /glocal/survey-checkins/verify
Content-Type: application/json
```

Request body:

```json
{
  "email": "guest@example.com"
}
```

If the user already completed the survey:

```json
{
  "success": true,
  "message": "Check-in verified",
  "data": {
    "completed": true
  },
  "timestamp": "2026-08-02T08:00:00.000Z"
}
```

If the user has not completed the survey:

```json
{
  "success": true,
  "message": "Check-in verified",
  "data": {
    "completed": false,
    "redirectUrl": "https://www.surveymonkey.com/r/GlocalCommunity?email=guest%40example.com"
  },
  "timestamp": "2026-08-02T08:00:00.000Z"
}
```

Invalid email response:

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "success": false,
  "message": "A valid email is required",
  "timestamp": "2026-08-02T08:00:00.000Z"
}
```

### Recommended Client Behavior

1. Ask the guest for their email.
2. Call `POST /glocal/survey-checkins/verify`.
3. If `data.completed === true`, show the guest as checked in.
4. If `data.completed === false`, redirect the guest to `data.redirectUrl`.
5. Do not call admin list/create/update/delete routes from a public guest client.

Example browser code:

```js
const API_BASE_URL = 'https://engagement.chula.ac.th/netzero-api/api/v1';

async function verifyGlocalCheckin(email) {
  const response = await fetch(`${API_BASE_URL}/glocal/survey-checkins/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Unable to verify check-in');
  }

  return payload.data;
}
```

Example usage:

```js
const result = await verifyGlocalCheckin('guest@example.com');

if (result.completed) {
  // Show success/check-in completed state.
} else {
  window.location.href = result.redirectUrl;
}
```

## Admin Authentication

Admin routes require a JWT from the main auth API.

### Login

```http
POST /auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

Use the token on protected routes:

```http
Authorization: Bearer JWT_TOKEN
```

Admin clients should only enable Glocal management screens when `data.user.role === "admin"`.

## Admin Survey Check-In Routes

These routes expose stored check-in records. They include email addresses, survey IDs, SurveyMonkey response IDs, status, and timestamps, so they must not be used from a public unauthenticated client.

### List Check-Ins

```http
GET /glocal/survey-checkins
Authorization: Bearer JWT_TOKEN
```

Successful response:

```json
{
  "success": true,
  "message": "Check-ins retrieved successfully",
  "data": [
    {
      "id": 1,
      "survey_id": "123456789",
      "identifier_type": "email",
      "identifier_value": "guest@example.com",
      "surveymonkey_response_id": "987654321",
      "status": "completed",
      "checked_in_at": "2026-08-02T08:00:00.000Z",
      "completed_at": "2026-08-02T08:05:00.000Z",
      "last_synced_at": "2026-08-02T08:05:00.000Z",
      "created_at": "2026-08-02T08:00:00.000Z",
      "updated_at": "2026-08-02T08:05:00.000Z"
    }
  ],
  "count": 1,
  "total": 1,
  "timestamp": "2026-08-02T08:10:00.000Z"
}
```

Supported query filters:

```txt
surveyId=<survey id>
status=not_started|partial|completed
limit=<number>
offset=<number>
```

Example:

```txt
GET /glocal/survey-checkins?status=completed
```

Current production note: `GET /glocal/survey-checkins` without pagination works. During testing on 2026-08-02, `?limit=50&offset=0` returned `500 Internal server error`, so avoid pagination parameters until the backend query issue is fixed.

### Get Check-In By ID

```http
GET /glocal/survey-checkins/:id
Authorization: Bearer JWT_TOKEN
```

Not found response:

```json
{
  "success": false,
  "message": "Check-in not found",
  "timestamp": "2026-08-02T08:00:00.000Z"
}
```

### Create Check-In

```http
POST /glocal/survey-checkins
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "surveyId": "123456789",
  "identifierValue": "guest@example.com",
  "status": "not_started"
}
```

`status` is optional and defaults to `not_started`.

### Update Check-In

```http
PATCH /glocal/survey-checkins/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "status": "completed",
  "surveymonkeyResponseId": "987654321"
}
```

At least one of `status` or `surveymonkeyResponseId` is required.

Allowed statuses:

```txt
not_started
partial
completed
```

When `status` is set to `completed`, the backend sets `completed_at`.

### Delete Check-In

```http
DELETE /glocal/survey-checkins/:id
Authorization: Bearer JWT_TOKEN
```

Successful response:

```json
{
  "success": true,
  "message": "Check-in deleted successfully",
  "timestamp": "2026-08-02T08:00:00.000Z"
}
```

## Webhook Route

This route is for SurveyMonkey only.

```http
POST /glocal/webhooks/surveymonkey
```

Do not call this from browser clients. SurveyMonkey sends this when a survey response is completed. The backend then fetches the response from SurveyMonkey, reads the `email` custom variable when present, falls back to the survey answer email field when needed, and marks the matching check-in row as `completed`.

## Error Handling

Common responses:

```http
400 Bad Request
```

The request body or ID is invalid.

```http
401 Unauthorized
```

The route requires a JWT, but none was sent.

```http
403 Forbidden
```

The JWT is invalid, expired, or the user is not an admin.

```http
404 Not Found
```

The route or check-in record does not exist.

```http
500 Internal Server Error
```

Server-side or database error.

## Minimal Integration Checklist

For a public guest check-in page:

1. Configure `API_BASE_URL=https://engagement.chula.ac.th/netzero-api/api/v1`.
2. Implement email input validation on the client.
3. Call `POST /glocal/survey-checkins/verify`.
4. Show checked-in success when `completed` is true.
5. Redirect to `redirectUrl` when `completed` is false.

For an admin dashboard:

1. Login with `POST /auth/login`.
2. Confirm the returned user has `role: "admin"`.
3. Store the JWT securely for the session.
4. Call `GET /glocal/survey-checkins` with `Authorization: Bearer <token>`.
5. Avoid pagination query parameters until the production pagination issue is fixed.
