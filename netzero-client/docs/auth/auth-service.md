# AuthService API Reference

## 🎯 Overview

`AuthService` is a stateless utility class that handles all authentication-related API operations and token management. It serves as the bridge between the AuthContext and the backend authentication system.

## 🏗️ Architecture

### Class Structure
```javascript
class AuthService {
  // Authentication operations
  static async register(userData)
  static async login(credentials)
  static async verifyToken()
  static async refreshToken()
  static async logout()
  
  // Token management
  static getToken()
  static isAuthenticated()
  static isTokenExpired()
  static clearAuthData()
  
  // Utility functions
  static validateEmail(email)
  static validatePassword(password)
  static handleAuthError(error)
}
```

### Key Characteristics
- **Stateless**: No internal state, only utility functions
- **Token Management**: Handles localStorage operations
- **Error Handling**: Standardized error processing
- **Validation**: Client-side validation utilities

## 🔐 Authentication Operations

### User Registration
```javascript
static async register(userData) {
  try {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
    
    if (response.data.success && response.data.data.token) {
      // Store token and user data in localStorage
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw this.handleAuthError(error);
  }
}
```

**Parameters:**
- `userData`: Object containing user registration information
  ```javascript
  {
    email: 'user@example.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890', // Optional
    address: 'User address'     // Optional
  }
  ```

**Returns:** API response with user data and token

### User Login
```javascript
static async login(credentials) {
  try {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw this.handleAuthError(error);
  }
}
```

**Parameters:**
- `credentials`: Object with login information
  ```javascript
  {
    email: 'user@example.com',
    password: 'userPassword'
  }
  ```

**Returns:** API response with user data and token

### Token Verification
```javascript
static async verifyToken() {
  try {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.VERIFY);
    
    if (response.data.success && response.data.data.user) {
      // Update stored user data with fresh data from server
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    this.clearAuthData();
    throw this.handleAuthError(error);
  }
}
```

**Purpose:** Validates current token with server and gets fresh user data

### Token Refresh
```javascript
static async refreshToken() {
  try {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    this.clearAuthData();
    throw this.handleAuthError(error);
  }
}
```

**Purpose:** Gets new JWT token using current token

### User Logout
```javascript
static async logout() {
  try {
    const token = this.getToken();
    
    if (token) {
      // Call logout endpoint for token blacklisting (optional)
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    this.clearAuthData();
    return { success: true, message: 'Logout successful' };
  } catch (error) {
    console.error('Logout error:', error);
    // Clear auth data even if logout request fails
    this.clearAuthData();
    return { success: true, message: 'Logout completed' };
  }
}
```

**Behavior:** Always clears local data, even if server call fails

## 🏪 Token Management

### Get Stored Token
```javascript
static getToken() {
  return localStorage.getItem('authToken');
}
```

### Get Stored User Data
```javascript
static getUserData() {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
```

### Check Authentication Status
```javascript
static isAuthenticated() {
  const token = this.getToken();
  const userData = this.getUserData();
  return !!(token && userData);
}
```

### Token Expiration Check
```javascript
static isTokenExpired() {
  const token = this.getToken();
  if (!token) return true;

  try {
    // Decode JWT token (basic check without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    return payload.exp < now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}
```

### Clear Authentication Data
```javascript
static clearAuthData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}
```

### Set Authentication Data
```javascript
static setAuthData(token, userData) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userData', JSON.stringify(userData));
}
```

## 🛡️ Authorization Utilities

### Role Checking
```javascript
static hasRole(role) {
  const userData = this.getUserData();
  return userData && userData.role === role;
}

static isAdmin() {
  return this.hasRole('admin');
}
```

### Authentication Headers
```javascript
static getAuthHeaders() {
  const token = this.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

## ✅ Validation Utilities

### Email Validation
```javascript
static validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Password Strength Validation
```javascript
static validatePassword(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain at least one number'] : [])
    ]
  };
}
```

## ⚠️ Error Handling

### Standardized Error Processing
```javascript
static handleAuthError(error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 401) {
      // Unauthorized - clear auth data
      this.clearAuthData();
    }
    
    return {
      message: data.message || 'Authentication error',
      status,
      errors: data.errors || []
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      errors: []
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      errors: []
    };
  }
}
```

### Error Types
- **401 Unauthorized**: Automatically clears auth data
- **Network Errors**: Returns connection error message
- **Server Errors**: Returns server-provided error message
- **Unknown Errors**: Returns generic error message

## 📡 API Integration

### Endpoints Configuration
```javascript
const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  VERIFY: '/api/v1/auth/verify',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout'
};
```

### Axios Integration
- Uses centralized `axiosInstance` from `./client.js`
- Automatic request/response interceptors for token management
- Consistent error handling across all requests

## 🔄 Relationship with AuthContext

### AuthContext → AuthService (Direct Calls)
```javascript
// AuthContext calls AuthService methods directly
const response = await AuthService.login(credentials);
const isValid = AuthService.isAuthenticated();
await AuthService.logout();
```

### AuthService → AuthContext (Indirect via Events)
AuthService doesn't directly call AuthContext, but can trigger context updates through global events dispatched by axios interceptors.

## 📝 Usage Examples

### Basic Login Flow
```javascript
try {
  const response = await AuthService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  if (response.success) {
    console.log('User logged in:', response.data.user);
  }
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Check Authentication Status
```javascript
if (AuthService.isAuthenticated() && !AuthService.isTokenExpired()) {
  // User is authenticated with valid token
  const userData = AuthService.getUserData();
  console.log('Current user:', userData);
}
```

### Validate User Input
```javascript
const emailValid = AuthService.validateEmail(email);
const passwordValidation = AuthService.validatePassword(password);

if (!emailValid) {
  console.error('Invalid email format');
}

if (!passwordValidation.isValid) {
  console.error('Password errors:', passwordValidation.errors);
}
```

## 🎯 Key Features

1. **Stateless Design**: No internal state, pure utility functions
2. **Token Management**: Complete JWT lifecycle management
3. **Error Standardization**: Consistent error handling patterns
4. **Validation**: Client-side input validation
5. **Security**: Automatic token cleanup on errors
6. **Flexibility**: Can be used independently or with AuthContext

This AuthService provides a robust, secure, and easy-to-use API layer for all authentication operations in the NetZero application.