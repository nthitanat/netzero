# NetZero Auth Workflow — Implementation Guide for AI

This document gives an AI agent everything it needs to implement the **exact** authentication workflow used in `netzero-client` from scratch in a new React project.

> **Production API Base URL:** `https://engagement.chula.ac.th/netzero-api`  
> **API prefix on all auth routes:** `/api/v1/auth/`

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Required Dependencies](#2-required-dependencies)
3. [File Structure to Create](#3-file-structure-to-create)
4. [Layer 1 — Storage Utility](#4-layer-1--storage-utility)
5. [Layer 2 — Axios Client with Interceptors](#5-layer-2--axios-client-with-interceptors)
6. [Layer 3 — AuthService (API layer)](#6-layer-3--authservice-api-layer)
7. [Layer 4 — AuthContext + AuthProvider](#7-layer-4--authcontext--authprovider)
8. [Layer 5 — Wrap the App](#8-layer-5--wrap-the-app)
9. [Layer 6 — useAuth Hook in Components](#9-layer-6--useauth-hook-in-components)
10. [Login Form — Minimal Example](#10-login-form--minimal-example)
11. [Register Form — Minimal Example](#11-register-form--minimal-example)
12. [Protected Route Pattern](#12-protected-route-pattern)
13. [Global Event Bus (Auto-logout)](#13-global-event-bus-auto-logout)
14. [localStorage Keys Reference](#14-localstorage-keys-reference)
15. [Complete State Shape Reference](#15-complete-state-shape-reference)

---

## 1. Architecture Overview

The auth system is layered. Each layer has a single responsibility and only talks to adjacent layers:

```
Component (JSX)
    ↕  useAuth() hook
AuthContext  (React Context + useReducer — global state)
    ↕  authService.login / register / logout / verifyToken
AuthService  (stateless class — calls API, writes localStorage)
    ↕  axiosInstance (axios with request/response interceptors)
storageService  (localStorage wrapper — single source for keys)
```

**Data flow for login:**
```
LoginForm calls → useAuth().login(credentials)
  → AuthContext dispatches SET_LOADING
  → authService.login(credentials) [HTTP POST]
  → storageService.saveAuthData(token, user)  ← side effect
  → AuthContext dispatches SET_USER
  → All components re-render with new state
```

**App startup flow:**
```
AuthProvider mounts
  → storageService has token? AND token not expired?
    YES → authService.verifyToken() [HTTP GET /verify]
          → success → dispatch SET_USER
          → failure → storageService.clearAuthData(), dispatch SET_USER(null)
    NO  → storageService.clearAuthData(), dispatch SET_USER(null)
```

---

## 2. Required Dependencies

```bash
npm install axios
```

React and React Router are assumed to already be present.

---

## 3. File Structure to Create

```
src/
├── utils/
│   └── storage.js          # Layer 1: localStorage wrapper
├── api/
│   ├── client.js           # Layer 2: axios instance + interceptors
│   └── auth.js             # Layer 3: AuthService class
├── contexts/
│   └── AuthContext.js      # Layer 4: context, reducer, provider, useAuth hook
└── App.js                  # Layer 5: wrap with <AuthProvider>
```

---

## 4. Layer 1 — Storage Utility

**File:** `src/utils/storage.js`

Centralizes all localStorage access. Every other layer imports from here — no raw `localStorage` calls elsewhere.

```javascript
class StorageService {
  constructor() {
    this.authKeys = {
      TOKEN: 'authToken',
      USER_DATA: 'userData',
    };
  }

  // ── Auth helpers ──────────────────────────────────────────

  getAuthToken() {
    return this.getItem(this.authKeys.TOKEN);
  }

  setAuthToken(token) {
    this.setItem(this.authKeys.TOKEN, token);
  }

  removeAuthToken() {
    this.removeItem(this.authKeys.TOKEN);
  }

  getUserData() {
    return this.getJSON(this.authKeys.USER_DATA);
  }

  setUserData(userData) {
    this.setJSON(this.authKeys.USER_DATA, userData);
  }

  removeUserData() {
    this.removeItem(this.authKeys.USER_DATA);
  }

  /** Call after successful login / register */
  saveAuthData(token, userData) {
    this.setAuthToken(token);
    this.setUserData(userData);
  }

  /** Call on logout or 401 */
  clearAuthData() {
    this.removeAuthToken();
    this.removeUserData();
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // ── Generic localStorage utilities ───────────────────────

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // silent
    }
  }

  getJSON(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setJSON(key, value) {
    this.setItem(key, JSON.stringify(value));
  }
}

export const storageService = new StorageService();
```

---

## 5. Layer 2 — Axios Client with Interceptors

**File:** `src/api/client.js`

Creates a shared axios instance. The **request interceptor** attaches the JWT token to every outgoing request. The **response interceptor** handles 401 and 403 globally by firing window events that `AuthContext` listens to.

```javascript
import axios from 'axios';
import { storageService } from '../utils/storage';

const BASE_URL = 'https://engagement.chula.ac.th/netzero-api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storageService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stale token and tell AuthContext to log out
      storageService.clearAuthData();
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: {
          message: error.response?.data?.message || 'Authentication required',
        },
      }));
    }

    if (status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: {
          message: error.response?.data?.message || 'Access denied',
        },
      }));
    }

    return Promise.reject(error);
  }
);
```

> **Important:** `axiosInstance` is a named export. Always import it as `{ axiosInstance }`.

---

## 6. Layer 3 — AuthService (API Layer)

**File:** `src/api/auth.js`

Stateless class. Calls the API and manages localStorage. Never touches React state.

```javascript
import { axiosInstance } from './client';
import { storageService } from '../utils/storage';

class AuthService {
  constructor() {
    this.endpoints = {
      REGISTER: '/api/v1/auth/register',
      LOGIN:    '/api/v1/auth/login',
      VERIFY:   '/api/v1/auth/verify',
      REFRESH:  '/api/v1/auth/refresh',
      LOGOUT:   '/api/v1/auth/logout',
    };
  }

  // ── API calls ─────────────────────────────────────────────

  async register(userData) {
    try {
      const response = await axiosInstance.post(this.endpoints.REGISTER, userData);
      if (response.data.success && response.data.data.token) {
        storageService.saveAuthData(response.data.data.token, response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async login(credentials) {
    try {
      const response = await axiosInstance.post(this.endpoints.LOGIN, credentials);
      if (response.data.success && response.data.data.token) {
        storageService.saveAuthData(response.data.data.token, response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await axiosInstance.get(this.endpoints.VERIFY);
      if (response.data.success && response.data.data.user) {
        storageService.setUserData(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await axiosInstance.post(this.endpoints.REFRESH, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && response.data.data.token) {
        storageService.saveAuthData(response.data.data.token, response.data.data.user);
      }
      return response.data;
    } catch (error) {
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await axiosInstance.post(this.endpoints.LOGOUT);
      }
    } catch {
      // ignore server error — always clear locally
    } finally {
      this.clearAuthData();
    }
    return { success: true };
  }

  // ── Local token helpers ───────────────────────────────────

  getToken() {
    return storageService.getAuthToken();
  }

  isAuthenticated() {
    return storageService.isAuthenticated();
  }

  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  clearAuthData() {
    storageService.clearAuthData();
  }

  // ── Error normalizer ──────────────────────────────────────

  handleAuthError(error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) this.clearAuthData();
      return {
        message: data?.message || 'Authentication error',
        status,
        errors: data?.errors || [],
      };
    }
    if (error.request) {
      return { message: 'Network error. Please check your connection.', status: 0, errors: [] };
    }
    return { message: error.message || 'An unexpected error occurred', status: 0, errors: [] };
  }
}

export const authService = new AuthService();
```

---

## 7. Layer 4 — AuthContext + AuthProvider

**File:** `src/contexts/AuthContext.js`

This is the single global auth state for the app. Uses `useReducer` for predictable state transitions.

```javascript
import React, {
  createContext, useContext, useReducer, useEffect, useCallback
} from 'react';
import { authService } from '../api/auth';

// ── Action types ──────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_LOADING:  'SET_LOADING',
  SET_USER:     'SET_USER',
  SET_ERROR:    'SET_ERROR',
  CLEAR_ERROR:  'CLEAR_ERROR',
  LOGOUT:       'LOGOUT',
  UPDATE_USER:  'UPDATE_USER',
};

// ── Initial state ─────────────────────────────────────────────
const initialState = {
  user: null,              // full user object or null
  isAuthenticated: false,
  isLoading: true,         // true until startup check finishes
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload, isAuthenticated: true, error: null };

    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Startup: restore session from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      try {
        if (authService.isAuthenticated() && !authService.isTokenExpired()) {
          const response = await authService.verifyToken();
          if (response.success && response.data.user) {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
          } else {
            throw new Error('Token verification failed');
          }
        } else {
          authService.clearAuthData();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        }
      } catch {
        authService.clearAuthData();
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    };
    initializeAuth();
  }, []);

  // Listen for global 401 / 403 events fired by the axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => dispatch({ type: AUTH_ACTIONS.LOGOUT });
    const handleForbidden = (event) =>
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: event.detail?.message || 'Access denied' });

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:forbidden', handleForbidden);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:forbidden', handleForbidden);
    };
  }, []);

  // ── Actions exposed to consumers ─────────────────────────

  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        return { success: true, user: response.data.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      const msg = error.message || 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: msg });
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    try {
      const response = await authService.register(userData);
      if (response.success && response.data.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        return { success: true, user: response.data.user };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      const msg = error.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: msg });
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // always log out locally even if server call fails
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const hasRole = useCallback((role) => state.user?.role === role, [state.user]);
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);

  // ── Context value ─────────────────────────────────────────
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    // Actions
    login,
    register,
    logout,
    clearError,
    // Utilities
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

---

## 8. Layer 5 — Wrap the App

**File:** `src/App.js`

`AuthProvider` must be the outermost wrapper so every component can access auth state.

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* your routes go here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

> `AuthProvider` must wrap `Router` (or any component that calls `useAuth`).

---

## 9. Layer 6 — useAuth Hook in Components

Any component anywhere in the tree can access the full auth state and actions:

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const {
    user,            // Object | null
    isAuthenticated, // boolean
    isLoading,       // boolean — true during startup check or async actions
    error,           // string | null
    login,           // async (credentials) → { success, user } | { success, error }
    register,        // async (userData)    → { success, user } | { success, error }
    logout,          // async ()
    clearError,      // ()
    hasRole,         // (role: string) → boolean
    isAdmin,         // () → boolean
  } = useAuth();
}
```

---

## 10. Login Form — Minimal Example

```jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm({ onSuccess }) {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login({ email, password });
    if (result.success) {
      onSuccess?.(result.user);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
```

**What happens internally:**
1. `login()` dispatches `SET_LOADING: true` and `CLEAR_ERROR`
2. Calls `POST /api/v1/auth/login` via axios
3. On success: saves `authToken` + `userData` to localStorage, dispatches `SET_USER`
4. On failure: dispatches `SET_ERROR` with the error message
5. Returns `{ success: boolean, user? , error? }` so the caller can react (e.g., close modal, redirect)

---

## 11. Register Form — Minimal Example

```jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterForm({ onSuccess }) {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '', address: '',
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Client-side password confirmation check
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // confirmPassword is NOT sent to the API
    const { confirmPassword, ...payload } = form;
    const result = await register(payload);
    if (result.success) {
      onSuccess?.(result.user);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Required */}
      <input name="email"     type="email"    value={form.email}     onChange={handleChange} placeholder="Email"      required />
      <input name="firstName" type="text"     value={form.firstName} onChange={handleChange} placeholder="First name" required />
      <input name="lastName"  type="text"     value={form.lastName}  onChange={handleChange} placeholder="Last name"  required />
      <input name="password"        type="password" value={form.password}        onChange={handleChange} placeholder="Password"         required />
      <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />

      {/* Optional */}
      <input name="phoneNumber" type="tel"  value={form.phoneNumber} onChange={handleChange} placeholder="Phone (optional)" />
      <input name="address"     type="text" value={form.address}     onChange={handleChange} placeholder="Address (optional)" />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}
```

**Password rules enforced by the server:**
- Minimum 6 characters, maximum 100
- At least one uppercase letter (`A–Z`)
- At least one lowercase letter (`a–z`)
- At least one digit (`0–9`)

---

## 12. Protected Route Pattern

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Wait until startup auth check completes
  if (isLoading) return <div>Loading…</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/forbidden" replace />;

  return children;
}

// Usage in App.js routes:
// <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
// <Route path="/admin"     element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
```

> `isLoading` starts as `true` and stays true until the startup `verifyToken` call resolves. Always gate protected routes behind this check to avoid a flash of redirect.

---

## 13. Global Event Bus (Auto-logout)

The axios interceptor fires window events on HTTP errors. `AuthContext` listens and reacts automatically — no manual handling needed in components.

| Window event | Fired when | AuthContext reaction |
|---|---|---|
| `auth:unauthorized` | Any API call returns `401` | Dispatches `LOGOUT` — clears user, isAuthenticated → false |
| `auth:forbidden` | Any API call returns `403` | Dispatches `SET_ERROR` with the server message |

This means if a stored token expires mid-session, the very next API call will automatically log the user out and clear localStorage.

---

## 14. localStorage Keys Reference

| Key | Value type | Set by | Cleared by |
|---|---|---|---|
| `authToken` | `string` (JWT) | `storageService.saveAuthData()` | `storageService.clearAuthData()` |
| `userData` | `JSON string` (user object) | `storageService.saveAuthData()` | `storageService.clearAuthData()` |

Both keys are always written together and cleared together. Never write them independently.

---

## 15. Complete State Shape Reference

### `AuthContext` value exposed to all consumers

```typescript
{
  // ── State ───────────────────────────────
  user: {
    id:            number
    email:         string
    firstName:     string
    lastName:      string
    role:          'user' | 'admin' | 'seller' | 'community_head'
    profileImage:  string | null
    phoneNumber:   string | null
    address:       string | null
    isActive:      boolean
    emailVerified: boolean
    lastLogin:     string | null   // ISO 8601
    createdAt:     string          // ISO 8601
    updatedAt:     string          // ISO 8601
  } | null,
  isAuthenticated: boolean,
  isLoading:       boolean,
  error:           string | null,

  // ── Actions (all async unless noted) ───
  login(credentials: { email: string; password: string })
    → Promise<{ success: true; user: User } | { success: false; error: string }>

  register(userData: {
    email: string; password: string;
    firstName: string; lastName: string;
    phoneNumber?: string; address?: string;
  }) → Promise<{ success: true; user: User } | { success: false; error: string }>

  logout() → Promise<void>    // always succeeds locally

  clearError() → void         // synchronous

  // ── Utilities ───────────────────────────
  hasRole(role: string) → boolean
  isAdmin()             → boolean
}
```

### `authReducer` state machine (valid transitions)

```
initialState (isLoading: true)
  ├─ startup: token valid   → SET_USER(user)  → isAuthenticated: true
  ├─ startup: no token      → SET_USER(null)  → isAuthenticated: false
  │
  ├─ login / register call  → SET_LOADING(true)
  │     ├─ success          → SET_USER(user)  → isAuthenticated: true
  │     └─ failure          → SET_ERROR(msg)  → isAuthenticated: false
  │
  ├─ logout                 → LOGOUT          → isAuthenticated: false
  └─ 401 from any API call  → LOGOUT (via window event)
```
