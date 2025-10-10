# AuthContext Deep Dive

## 🎯 Overview

The `AuthContext` is the heart of the authentication system, providing centralized state management and authentication functions for the entire application using React's Context API and useReducer pattern.

## 🏗️ Architecture

### State Structure
```javascript
const initialState = {
  user: null,              // User data object or null
  isAuthenticated: false,  // Boolean authentication status
  isLoading: true,         // Loading state for async operations
  error: null             // Error messages from failed operations
};
```

### Action Types
```javascript
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',      // Control loading states
  SET_USER: 'SET_USER',            // Set user data after login/register
  SET_ERROR: 'SET_ERROR',          // Set error messages
  CLEAR_ERROR: 'CLEAR_ERROR',      // Clear error messages
  LOGOUT: 'LOGOUT',                // Reset to unauthenticated state
  UPDATE_USER: 'UPDATE_USER'       // Update user profile information
};
```

## 🔄 Reducer Logic

The `authReducer` is a pure function that manages all state transitions:

```javascript
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,  // Convert to boolean
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    // ... other cases
  }
};
```

### Key Reducer Principles
- **Immutability**: Always returns new state object
- **Predictability**: Same action always produces same result
- **Single Source of Truth**: All auth state changes go through reducer

## 🚀 Initialization Process

When the app starts, AuthContext automatically:

1. **Checks for existing authentication**
   ```javascript
   if (AuthService.isAuthenticated() && !AuthService.isTokenExpired())
   ```

2. **Verifies token with server**
   ```javascript
   const response = await AuthService.verifyToken();
   ```

3. **Updates state based on verification**
   - Valid token → Set user data
   - Invalid token → Clear auth data

## 📡 Global Event System

AuthContext listens for authentication events from API interceptors:

```javascript
useEffect(() => {
  const handleUnauthorized = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const handleForbidden = (event) => {
    dispatch({ 
      type: AUTH_ACTIONS.SET_ERROR, 
      payload: event.detail?.message || 'Access denied' 
    });
  };

  window.addEventListener('auth:unauthorized', handleUnauthorized);
  window.addEventListener('auth:forbidden', handleForbidden);
}, []);
```

### Event Sources
- `auth:unauthorized` → Automatic logout on 401 responses
- `auth:forbidden` → Show error on 403 responses

## 🔐 Authentication Functions

### Login Process
```javascript
const login = useCallback(async (credentials) => {
  dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  try {
    const response = await AuthService.login(credentials);
    
    if (response.success && response.data.user) {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      return { success: true, user: response.data.user };
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    const errorMessage = error.message || 'Login failed. Please try again.';
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}, []);
```

### Registration Process
Similar to login but uses `AuthService.register()` and automatically authenticates the user upon successful registration.

### Logout Process
```javascript
const logout = useCallback(async () => {
  try {
    await AuthService.logout(); // Server-side cleanup
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    dispatch({ type: AUTH_ACTIONS.LOGOUT }); // Client-side cleanup
  }
}, []);
```

## 👤 Profile Management

### Update Profile
```javascript
const updateProfile = useCallback(async (userData) => {
  dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  try {
    const response = await UserService.updateCurrentUser(userData);
    
    if (response.success && response.data.user) {
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data.user });
      return { success: true, user: response.data.user };
    } else {
      throw new Error(response.message || 'Profile update failed');
    }
  } catch (error) {
    const errorMessage = error.message || 'Profile update failed. Please try again.';
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
}, []);
```

### Delete Account
Includes email confirmation validation:
```javascript
const deleteAccount = useCallback(async (confirmationEmail) => {
  // Validate email confirmation
  if (!confirmationEmail || confirmationEmail !== state.user?.email) {
    throw new Error('Email confirmation does not match your account email');
  }

  const response = await UserService.deleteCurrentUser();
  
  if (response.success) {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    return { success: true, message: response.message };
  }
}, [state.user?.email]);
```

## 🛡️ Authorization Functions

### Role Checking
```javascript
const hasRole = useCallback((role) => {
  return state.user && state.user.role === role;
}, [state.user]);

const isAdmin = useCallback(() => {
  return hasRole('admin');
}, [hasRole]);
```

### Display Utilities
```javascript
const getDisplayName = useCallback(() => {
  return UserService.getDisplayName(state.user);
}, [state.user]);

const getUserInitials = useCallback(() => {
  return UserService.getUserInitials(state.user);
}, [state.user]);
```

## 🔒 Higher-Order Components (HOCs)

### Authentication Guard
```javascript
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this content.</div>;
    }
    
    return <Component {...props} />;
  };
};
```

### Role-Based Guard
```javascript
export const withRole = (Component, requiredRole) => {
  return function RoleProtectedComponent(props) {
    const { hasRole, isLoading, isAuthenticated } = useAuth();
    
    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please log in to access this content.</div>;
    if (!hasRole(requiredRole)) return <div>You don't have permission to access this content.</div>;
    
    return <Component {...props} />;
  };
};
```

## 📊 Context Impact Analysis

### Components That Re-render
When AuthContext state changes, these components automatically re-render:
- ✅ Navigation bar (to show user menu)
- ✅ Login modal (to close/hide)  
- ✅ Protected pages (to show content)
- ✅ User profile sections
- ✅ Any component calling `useAuth()`

### Components That Don't Re-render
- ❌ Product listings
- ❌ Static content areas
- ❌ Components not using auth context

### Performance Optimization
```javascript
// Context value is memoized to prevent unnecessary re-renders
const value = {
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  login,     // useCallback prevents recreation
  logout,    // useCallback prevents recreation
  // ... other functions
};
```

## 🔧 Usage Patterns

### Basic Authentication Check
```javascript
const { isAuthenticated, isLoading, user } = useAuth();

if (isLoading) return <Loading />;
if (!isAuthenticated) return <LoginPrompt />;
return <AuthenticatedContent user={user} />;
```

### Role-Based Rendering
```javascript
const { hasRole, isAdmin } = useAuth();

return (
  <div>
    {hasRole('seller') && <SellerDashboard />}
    {isAdmin() && <AdminPanel />}
  </div>
);
```

### Error Handling
```javascript
const { updateProfile, error, clearError } = useAuth();

const handleSave = async (profileData) => {
  const result = await updateProfile(profileData);
  if (result.success) {
    // Handle success
  } else {
    // Error is automatically set in context
  }
};
```

## 🎯 Key Design Principles

1. **Single Source of Truth**: All auth state in one place
2. **Predictable Updates**: All changes go through reducer
3. **Error Isolation**: Auth errors don't crash the app
4. **Performance**: Only affected components re-render
5. **Security**: Token validation and automatic cleanup
6. **Flexibility**: HOCs for different protection levels

This AuthContext provides a production-ready authentication system that handles edge cases, provides excellent developer experience, and maintains security best practices throughout the application lifecycle.