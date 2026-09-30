# NetZero Auth API Reference

> **Base URL (Production):** `https://engagement.chula.ac.th/netzero-api`  
> **Content-Type:** `application/json`  
> **Rate limit:** 100 requests per 15 minutes per IP (applies to all auth endpoints)

---

## Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and get JWT token | No |
| `GET` | `/api/auth/verify` | Verify token and get current user | Yes (Bearer) |
| `POST` | `/api/auth/refresh` | Refresh an existing JWT token | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Invalidate session (client-side token removal) | Yes (Bearer) |

---

## POST `/api/auth/register`

Registers a new user account and returns a JWT token on success.

### Request Body

```json
{
  "email":       "string (required) — valid email address",
  "password":    "string (required) — min 6, max 100 chars; must contain uppercase, lowercase, and a digit",
  "firstName":   "string (required) — 2–50 chars, letters and spaces only",
  "lastName":    "string (required) — 2–50 chars, letters and spaces only",
  "phoneNumber": "string (optional) — valid mobile phone number",
  "address":     "string (optional) — max 500 chars"
}
```

### Example Request

```http
POST https://engagement.chula.ac.th/netzero-api/api/auth/register
Content-Type: application/json

{
  "email": "somchai@example.com",
  "password": "Secure123",
  "firstName": "Somchai",
  "lastName": "Jaidee",
  "phoneNumber": "0812345678",
  "address": "123 Phayathai Rd, Bangkok"
}
```

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "<JWT>",
    "user": {
      "id": 42,
      "email": "somchai@example.com",
      "firstName": "Somchai",
      "lastName": "Jaidee",
      "role": "user",
      "profileImage": null,
      "phoneNumber": "0812345678",
      "address": "123 Phayathai Rd, Bangkok",
      "isActive": true,
      "emailVerified": false,
      "lastLogin": null,
      "createdAt": "2026-05-20T10:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  }
}
```

### Error Responses

| Status | `message` | Cause |
|--------|-----------|-------|
| `400` | `"Email, password, first name, and last name are required"` | Missing required field |
| `400` | `"Password must contain at least one uppercase letter, one lowercase letter, and one number"` | Weak password |
| `400` | `"First name can only contain letters and spaces"` | Invalid characters in name |
| `409` | `"User with this email already exists"` | Duplicate email |
| `429` | `"Too many requests"` | Rate limit hit |
| `500` | `"Internal server error during registration"` | Server error |

---

## POST `/api/auth/login`

Authenticates an existing user and returns a JWT token.

### Request Body

```json
{
  "email":    "string (required)",
  "password": "string (required)"
}
```

### Example Request

```http
POST https://engagement.chula.ac.th/netzero-api/api/auth/login
Content-Type: application/json

{
  "email": "somchai@example.com",
  "password": "Secure123"
}
```

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT>",
    "user": {
      "id": 42,
      "email": "somchai@example.com",
      "firstName": "Somchai",
      "lastName": "Jaidee",
      "role": "user",
      "profileImage": null,
      "phoneNumber": "0812345678",
      "address": "123 Phayathai Rd, Bangkok",
      "isActive": true,
      "emailVerified": false,
      "lastLogin": "2026-05-20T09:00:00.000Z",
      "createdAt": "2026-05-20T08:00:00.000Z",
      "updatedAt": "2026-05-20T09:00:00.000Z"
    }
  }
}
```

### Error Responses

| Status | `message` | Cause |
|--------|-----------|-------|
| `400` | `"Email and password are required"` | Missing field |
| `401` | `"Invalid email or password"` | Wrong credentials or inactive account |
| `429` | `"Too many requests"` | Rate limit hit |
| `500` | `"Internal server error during login"` | Server error |

---

## GET `/api/auth/verify`

Verifies the current JWT token and returns the authenticated user's data.

### Request Headers

```
Authorization: Bearer <JWT>
```

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": { ...same user object as login... }
  }
}
```

### Error Responses

| Status | `message` | Cause |
|--------|-----------|-------|
| `401` | `"No token provided"` | Missing Authorization header |
| `401` | `"Invalid token"` | Malformed JWT |
| `401` | `"Token expired"` | JWT past expiry |
| `401` | `"User not found"` | User was deleted after token was issued |

---

## User Object Reference

All auth endpoints that return user data share this shape (password is **never** returned):

```typescript
{
  id:             number       // auto-increment primary key
  email:          string       // unique
  firstName:      string
  lastName:       string
  role:           "user" | "admin" | "seller" | "community_head"
  profileImage:   string | null  // URL
  phoneNumber:    string | null
  address:        string | null
  isActive:       boolean
  emailVerified:  boolean
  lastLogin:      string | null  // ISO 8601 datetime
  createdAt:      string         // ISO 8601 datetime
  updatedAt:      string         // ISO 8601 datetime
}
```

---

## Using the JWT Token

Store the token returned by `/register` or `/login` and send it in the `Authorization` header for all protected API calls:

```http
Authorization: Bearer <JWT>
```

Token lifetime is **24 hours** in production. After expiry, the user must log in again or call `/api/auth/refresh`.

---

## Common Integration Pattern (fetch)

```javascript
const BASE_URL = 'https://engagement.chula.ac.th/netzero-api';

// Register
async function register(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json(); // { success, message, data: { token, user } }
}

// Login
async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json(); // { success, message, data: { token, user } }
}

// Authenticated request example
async function getVerifiedUser(token) {
  const res = await fetch(`${BASE_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

---

## Password Rules (quick reference)

- Minimum **6** characters, maximum **100** characters  
- Must include at least one **uppercase** letter (`A–Z`)  
- Must include at least one **lowercase** letter (`a–z`)  
- Must include at least one **digit** (`0–9`)

Examples: `Secure123`, `NetZero2026`, `Admin@1`
