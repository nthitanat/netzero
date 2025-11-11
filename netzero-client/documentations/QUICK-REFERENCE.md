# NetZero Client - Quick Reference Guide

> Fast reference for common patterns and standards.

---

## 🚀 Quick Links

- **[Full README](./README.md)** - Complete documentation
- **[API Standards](./API-STANDARDS.md)** - Mandatory API patterns
- **[Copilot Instructions](./.copilot-instructions.md)** - AI coding standards

---

## ✅ The 4 Golden Rules

### 1. API Service Pattern
```javascript
// Export singleton + default
export const serviceName = new ServiceName();
export default serviceName;
```

### 2. Import via Barrel
```javascript
// ✅ Always use this
import { authService } from '../../api';
```

### 3. Use storageService
```javascript
// ✅ Always use this
storageService.getAuthToken();
```

### 4. Use AuthContext
```javascript
// ✅ In components
const { user } = useAuth();
```

---

## 📦 Common Imports

### API Services
```javascript
import { 
  authService,
  userService,
  eventsService,
  productsService,
  reservationsService,
  treesService,
  chatService
} from '../../api';
```

### API Types
```javascript
import { 
  ApiError, 
  ApiResponse,
  API_STATUS, 
  API_ERROR_TYPES 
} from '../../api';
```

### Storage
```javascript
import { storageService } from '../utils/storage';
```

### Auth Context
```javascript
import { useAuth } from '../../contexts/AuthContext';
```

---

## 🔑 storageService Methods

### Auth Operations
```javascript
storageService.getAuthToken()
storageService.setAuthToken(token)
storageService.getUserData()
storageService.setUserData(userData)
storageService.saveAuthData(token, userData)
storageService.clearAuthData()
storageService.isAuthenticated()
```

### General Operations
```javascript
storageService.getItem(key)
storageService.setItem(key, value)
storageService.removeItem(key)
storageService.getJSON(key)
storageService.setJSON(key, data)
```

---

## 🎯 useAuth Hook Methods

```javascript
const {
  user,              // Current user object
  isAuthenticated,   // Boolean auth state
  isLoading,         // Loading state
  error,             // Error state
  login,             // Login function
  logout,            // Logout function
  register,          // Register function
  updateUser         // Update user function
} = useAuth();
```

---

## 🛠️ API Service Template

```javascript
import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

class ServiceName {
  constructor() {
    this.baseUrl = '/api/v1/resource';
    this.cacheTimeout = 300000;
  }

  async getAll(options = {}) {
    try {
      const response = await axiosInstance.get(this.baseUrl, { params: options });
      return ApiResponse.success(response.data.data);
    } catch (error) {
      throw new ApiError(
        error.response?.data?.message || 'Failed',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500
      );
    }
  }
}

export const serviceName = new ServiceName();
export default serviceName;
```

---

## 📝 Component Template

```javascript
import React from 'react';
import styles from './Component.module.scss';
import useComponent from './useComponent';
import ComponentHandler from './ComponentHandler';

export default function Component({ prop1, prop2 }) {
  const { stateComponent, setComponent } = useComponent();
  const handlers = ComponentHandler(stateComponent, setComponent);

  return (
    <div className={styles.Container}>
      {/* Content */}
    </div>
  );
}
```

---

## 🎨 SCSS Quick Reference

### Colors
```scss
@include color-palette("primary-color-1");    // Dark Green
@include color-palette("primary-color-2");    // Medium Green
@include color-palette("secondary-color-1");  // Dark Pink
```

### Font Sizes
```scss
@include font-size-palette("headline-3");  // 24px
@include font-size-palette("body-1");      // 16px
@include font-size-palette("body-2");      // 14px
```

### Animations
```scss
@include fade-in-animation(0.3s);
@include expand-animation(0.3s, 200px, 300px);
```

---

## 🚫 Common Mistakes

### ❌ DON'T
```javascript
// Direct localStorage
localStorage.getItem('authToken');

// Direct service import
import { authService } from '../../api/auth';

// Export class
export { ServiceName };

// Static methods
class Service {
  static getAll() { }
}

// AuthService in components
import { authService } from '../../api';
```

### ✅ DO
```javascript
// Use storageService
storageService.getAuthToken();

// Barrel import
import { authService } from '../../api';

// Export singleton
export const serviceName = new ServiceName();
export default serviceName;

// Instance methods
class Service {
  async getAll() { }
}

// Use AuthContext
const { user } = useAuth();
```

---

## 🔍 Debugging Tips

### Check Auth State
```javascript
console.log('Token:', storageService.getAuthToken());
console.log('User:', storageService.getUserData());
console.log('Is Auth:', storageService.isAuthenticated());
```

### API Error Handling
```javascript
try {
  const response = await eventsService.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Error type:', error.type);
    console.log('Status code:', error.statusCode);
  }
}
```

### Clear Cache
```javascript
// Clear specific service cache
eventsService.clearCache();

// Clear all API cache
apiCache.clear();
```

---

## 📊 File Structure Quick View

```
src/
├── api/                    # API services (use barrel import)
│   └── index.js           # Barrel export (import from here!)
├── components/            # Reusable components
├── contexts/              # React contexts
│   └── AuthContext.js    # Use this for auth in components
├── pages/                 # Page components
├── utils/                 # Utilities
│   └── storage.js        # Use this for localStorage
└── App.js                # Root component
```

---

## ⚡ Common Commands

```bash
# Development
npm start                 # Start dev server
npm run build            # Build for production

# Code Quality
npm run lint             # Lint code
npm run format           # Format code

# Testing
npm test                 # Run tests
```

---

## 📞 Need Help?

1. Check [API-STANDARDS.md](./API-STANDARDS.md) for API patterns
2. Check [README.md](./README.md) for full documentation
3. Check [.copilot-instructions.md](./.copilot-instructions.md) for component patterns
4. Ask the team!

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0  
**Status:** ✅ Standardized
