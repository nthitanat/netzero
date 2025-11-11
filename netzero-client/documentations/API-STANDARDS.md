# API Service Layer Standards - MANDATORY PATTERNS

> **CRITICAL:** These patterns are mandatory for all API service code. Violations will cause inconsistency and must be corrected immediately.

---

## 🎯 Core Principles

1. **100% Consistency:** All services follow identical patterns
2. **Centralized Storage:** All localStorage via `storageService`
3. **Barrel Exports:** All imports via `src/api/index.js`
4. **Instance Pattern:** No static methods, only instance methods
5. **Singleton Pattern:** Export single instance per service

---

## 📋 Pattern 1: API Service Class Structure

### **Mandatory Template**

```javascript
// api/serviceName.js
import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

/**
 * ServiceName API Service
 * Description of what this service handles
 */
class ServiceName {
  constructor() {
    this.baseUrl = '/api/v1/resource';
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Get resources with optional pagination
   * @param {Object} options - Query options
   * @returns {Promise<ApiResponse>}
   */
  async getResources(options = {}) {
    try {
      // Check cache
      const cacheKey = `resources-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached data');
        return cached;
      }

      // Make request
      const response = await axiosInstance.get(this.baseUrl, { params: options });

      // Wrap in ApiResponse
      const apiResponse = new ApiResponse(
        response.data.data || response.data,
        'success',
        response.data.message || 'Resources retrieved successfully'
      );

      // Cache response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log('✅ Fetched resources from API');
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching resources:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch resources',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    apiCache.clear();
  }
}

// Export singleton instance
export const serviceName = new ServiceName();

// Export as default for flexibility
export default serviceName;
```

---

## 📋 Pattern 2: Export Pattern (MANDATORY)

### **✅ CORRECT Export Pattern**

```javascript
// At the end of every service file:

// Export singleton instance
export const serviceName = new ServiceName();

// Export as default for flexibility
export default serviceName;
```

### **❌ FORBIDDEN Export Patterns**

```javascript
// ❌ DON'T export class
export { ServiceName };

// ❌ DON'T export multiple instances
export const service1 = new ServiceName();
export const service2 = new ServiceName();

// ❌ DON'T use method destructuring
export const { getMethod, postMethod } = serviceName;

// ❌ DON'T use static methods
class ServiceName {
  static getMethod() { } // WRONG!
}
```

---

## 📋 Pattern 3: Import Pattern (MANDATORY)

### **✅ CORRECT Import Pattern**

**Always import via barrel export:**

```javascript
// In components, pages, handlers, hooks:
import { authService, userService, eventsService } from '../../api';
import { ApiError, API_STATUS, API_ERROR_TYPES } from '../../api';

// For multiple services:
import { 
  authService, 
  userService, 
  productsService,
  reservationsService 
} from '../../../api';
```

### **❌ FORBIDDEN Import Patterns**

```javascript
// ❌ DON'T import directly from service files
import { authService } from '../../api/auth';
import { eventsService } from '../api/events';

// ❌ DON'T import from individual files
import authService from '../../api/auth.js';

// Exception: Internal API dependencies (auth.js importing from client.js is OK)
```

---

## 📋 Pattern 4: localStorage Pattern (MANDATORY)

### **✅ CORRECT localStorage Usage**

**All localStorage access MUST go through `storageService`:**

```javascript
import { storageService } from '../utils/storage';

// Auth operations
const token = storageService.getAuthToken();
const user = storageService.getUserData();
storageService.saveAuthData(token, userData);
storageService.clearAuthData();
const isAuth = storageService.isAuthenticated();

// General operations
const value = storageService.getItem('key');
storageService.setItem('key', 'value');
storageService.removeItem('key');

// JSON operations
const data = storageService.getJSON('key');
storageService.setJSON('key', { data: 'value' });
```

### **❌ FORBIDDEN localStorage Patterns**

```javascript
// ❌ NEVER access localStorage directly
localStorage.getItem('authToken');
localStorage.setItem('authToken', token);
window.localStorage.getItem('userData');

// ❌ NEVER use sessionStorage
sessionStorage.getItem('data');

// ❌ NEVER hardcode storage keys
const TOKEN_KEY = 'authToken'; // Use storageService.authKeys instead
```

---

## 📋 Pattern 5: Barrel Export Configuration

### **api/index.js Structure**

```javascript
// Import all services
import { eventsService } from './events.js';
import { productsService } from './products.js';
import { reservationsService } from './reservations.js';
import { treesService } from './trees.js';
import { locationTreesService } from './locationTrees.js';
import { chatService } from './chat.js';
import { eventProductsService } from './eventProducts.js';
import { userEventsService } from './userEvents.js';
import { authService } from './auth.js';
import { userService } from './users.js';

// Re-export services
export { axiosInstance } from './client.js';
export { eventsService } from './events.js';
export { productsService } from './products.js';
export { reservationsService } from './reservations.js';
export { treesService } from './trees.js';
export { locationTreesService } from './locationTrees.js';
export { chatService } from './chat.js';
export { eventProductsService } from './eventProducts.js';
export { userEventsService } from './userEvents.js';
export { authService } from './auth.js';
export { userService } from './users.js';

// Re-export types
export { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError, 
  API_STATUS, 
  API_ERROR_TYPES,
  apiCache,
  createApiConfig 
} from './types.js';

// Convenience object (optional)
export const api = {
  events: eventsService,
  products: productsService,
  reservations: reservationsService,
  trees: treesService,
  locationTrees: locationTreesService,
  chat: chatService,
  eventProducts: eventProductsService,
  userEvents: userEventsService,
  auth: authService,
  users: userService,
};
```

---

## 📋 Pattern 6: AuthContext Integration

### **✅ CORRECT Component Pattern**

```javascript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Component() {
  // Use AuthContext, NOT authService directly
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // AuthContext handles token storage via storageService
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <button onClick={() => handleLogin(credentials)}>Login</button>
      )}
    </div>
  );
}
```

### **❌ FORBIDDEN Component Patterns**

```javascript
// ❌ DON'T import authService in components
import { authService } from '../../api';

// ❌ DON'T bypass AuthContext
const user = authService.getCurrentUser();
await authService.login(credentials);

// ❌ DON'T access localStorage directly
const user = JSON.parse(localStorage.getItem('userData'));
```

---

## 📋 Pattern 7: Error Handling

### **✅ CORRECT Error Handling**

```javascript
async getResource(id) {
  try {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    
    return ApiResponse.success(
      response.data.data,
      response.data.message || 'Resource retrieved'
    );
    
  } catch (error) {
    console.error('❌ Error fetching resource:', error);
    
    // Handle specific error types
    if (error.response?.status === 404) {
      throw new ApiError(
        'Resource not found',
        API_ERROR_TYPES.NOT_FOUND_ERROR,
        404
      );
    }
    
    if (error.response?.status === 401) {
      throw new ApiError(
        'Unauthorized',
        API_ERROR_TYPES.AUTHORIZATION_ERROR,
        401
      );
    }
    
    // Generic error
    throw new ApiError(
      error.response?.data?.message || 'Failed to fetch resource',
      API_ERROR_TYPES.SERVER_ERROR,
      error.response?.status || 500,
      { originalError: error.message }
    );
  }
}
```

---

## 📋 Pattern 8: Caching Strategy

### **✅ CORRECT Caching Pattern**

```javascript
async getResources(options = {}) {
  try {
    // Create unique cache key
    const cacheKey = `resources-${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('📦 Using cached resources data');
      return cached;
    }

    // Fetch from API
    const response = await axiosInstance.get(this.baseUrl, { params: options });
    const apiResponse = ApiResponse.success(response.data.data);

    // Cache the response
    apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

    return apiResponse;
  } catch (error) {
    // Handle error
  }
}

// Clear cache when data changes
async createResource(data) {
  const response = await axiosInstance.post(this.baseUrl, data);
  
  // Clear cache since data changed
  this.clearCache();
  
  return ApiResponse.success(response.data.data);
}

clearCache() {
  apiCache.clear();
  console.log('🧹 Cache cleared');
}
```

---

## 📋 Pattern 9: Method Naming Conventions

### **Standard Method Names**

```javascript
class ServiceName {
  // GET methods
  async getAll(options = {}) { }
  async getById(id) { }
  async getByCategory(category) { }
  
  // POST methods
  async create(data) { }
  
  // PUT/PATCH methods
  async update(id, data) { }
  async partialUpdate(id, data) { }
  
  // DELETE methods
  async delete(id) { }
  async softDelete(id) { }
  
  // Utility methods
  clearCache() { }
  clearCacheEntry(key) { }
}
```

---

## 📋 Pattern 10: Logging Conventions

### **Standard Logging**

```javascript
// Success logs with ✅
console.log('✅ Resource fetched successfully');
console.log(`✅ Created resource ID: ${response.data.id}`);

// Cache logs with 📦
console.log('📦 Using cached data');

// Error logs with ❌
console.error('❌ Error fetching resource:', error);

// Info logs with ℹ️ or 📋
console.log('📋 Processing request...');

// Clear logs with 🧹
console.log('🧹 Cache cleared');
```

---

## ✅ Compliance Checklist

When creating or modifying API services, verify:

- [ ] Class uses instance pattern (no static methods)
- [ ] Constructor sets `baseUrl` and `cacheTimeout`
- [ ] All methods are async for API calls
- [ ] Exports singleton instance: `export const service = new Service()`
- [ ] Exports default: `export default service`
- [ ] No class export: `export { Service }` ❌
- [ ] No method destructuring exports ❌
- [ ] Uses `apiCache` for caching
- [ ] Wraps responses in `ApiResponse`
- [ ] Throws `ApiError` for errors
- [ ] No direct `localStorage` access
- [ ] All imports via barrel export (`from '../../api'`)
- [ ] Proper JSDoc comments
- [ ] Consistent logging with emojis
- [ ] Error handling for all async methods

---

## 🚨 Common Violations to Avoid

### **1. Mixed Export Patterns**
```javascript
// ❌ WRONG
export const service = new Service();
export { Service }; // Don't export class

// ✅ CORRECT
export const service = new Service();
export default service;
```

### **2. Direct Imports**
```javascript
// ❌ WRONG
import { authService } from '../api/auth';

// ✅ CORRECT
import { authService } from '../api';
```

### **3. Direct localStorage Access**
```javascript
// ❌ WRONG
localStorage.getItem('authToken');

// ✅ CORRECT
storageService.getAuthToken();
```

### **4. Static Methods**
```javascript
// ❌ WRONG
class Service {
  static getAll() { }
}

// ✅ CORRECT
class Service {
  async getAll() { }
}
```

---

## 📚 Quick Reference

| Pattern | Correct | Incorrect |
|---------|---------|-----------|
| **Export** | `export const service = new Service(); export default service;` | `export { Service };` |
| **Import** | `import { service } from '../../api';` | `import { service } from '../../api/service';` |
| **Storage** | `storageService.getAuthToken()` | `localStorage.getItem('authToken')` |
| **Methods** | `async getAll() { }` | `static getAll() { }` |
| **Auth** | `const { user } = useAuth();` | `authService.getCurrentUser()` |

---

**Enforcement:** These patterns are enforced through code review and should be validated before any PR is merged.

**Last Updated:** November 11, 2025  
**Status:** 🔒 Locked - Do not deviate from these patterns
