# NetZero Authentication System

## 🎯 Overview

The NetZero authentication system is a comprehensive, production-ready React authentication solution built with modern patterns and best practices. It provides secure user authentication, authorization, and session management throughout the application.

## 🏗️ Architecture Components

### Core Components
1. **AuthContext** - React Context using useReducer for global auth state
2. **AuthService** - Stateless API service layer for authentication operations
3. **LoginModal** - User interface for authentication interactions
4. **UserService** - User profile and account management operations

### Key Features
- JWT token-based authentication
- Automatic token validation and refresh
- Role-based access control (RBAC)
- Global error handling
- Session persistence
- Account management (profile, password, deletion)

## 📊 System Flow Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │───▶│   AuthContext    │───▶│   AuthService   │
│  (LoginModal)   │    │  (State Mgmt)    │    │  (API Layer)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        ▲                        ▲                        │
        │                        │                        ▼
        │                        │               ┌─────────────────┐
        │                        └───────────────│   Backend API   │
        └────────────────────────────────────────┤   (Server)      │
                   Re-render on state change     └─────────────────┘
```

## 🔄 Authentication Flow

### 1. **Application Startup**
```
App loads → AuthProvider initializes → Check stored token → Verify with server
```

### 2. **User Login**
```
User fills form → LoginModal calls AuthContext.login() → AuthService.login()
→ API call → Store token → Update context → All components re-render
```

### 3. **Automatic Session Management**
```
API call → 401 error → Global event → AuthContext logout → User redirected
```

## 🧠 Key Concepts

### useReducer Pattern
Instead of multiple `useState` calls, the system uses `useReducer` for predictable state management:

- **Actions**: Describe what happened (`LOGIN`, `LOGOUT`, `SET_ERROR`)
- **Reducer**: Pure function that calculates new state
- **Dispatch**: Function to trigger state changes

### Direct vs Indirect Connections
- **LoginModal → AuthContext**: DIRECT (via useAuth hook)
- **AuthContext → AuthService**: DIRECT (method calls)
- **AuthService → AuthContext**: INDIRECT (via global events)

### State Synchronization
When AuthContext state changes, ALL components using `useAuth()` automatically re-render with new data.

## 🛡️ Security Features

1. **Token Validation**: Server-side verification on app initialization
2. **Automatic Logout**: On token expiration or unauthorized responses
3. **Email Confirmation**: Required for sensitive operations like account deletion
4. **Role-Based Access**: Built-in authorization checking with HOCs
5. **Error Isolation**: Authentication errors don't crash the application

## 📁 File Structure

```
src/
├── contexts/
│   └── AuthContext.js          # Global auth state management
├── api/
│   ├── auth.js                 # Authentication API service
│   └── users.js                # User management API service
└── components/
    └── auth/
        └── LoginModal/
            ├── LoginModal.jsx           # UI component
            └── LoginModalHandler.js     # Business logic
```

## 🚀 Getting Started

### Using Authentication in Components

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome {user.name}!</div>;
}
```

### Protecting Routes with HOCs

```javascript
import { withAuth, withRole } from '../contexts/AuthContext';

// Require authentication
const ProtectedComponent = withAuth(MyComponent);

// Require specific role
const AdminComponent = withRole(MyComponent, 'admin');
```

## 📚 Detailed Documentation

- [AuthContext Deep Dive](./auth-context.md)
- [AuthService API Reference](./auth-service.md)
- [LoginModal Component Guide](./login-modal.md)
- [React Patterns Explained](./react-patterns.md)

---
*This documentation reflects the current implementation as of October 10, 2025*