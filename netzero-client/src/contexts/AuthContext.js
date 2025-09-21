import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AuthService from '../api/auth';
import UserService from '../api/users';

// Action types for authentication state management
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER'
};

// Initial authentication state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Authentication reducer to manage state changes
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
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

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };

    default:
      return state;
  }
};

// Create authentication context
const AuthContext = createContext(null);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      try {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated() && !AuthService.isTokenExpired()) {
          // Verify token with server
          const response = await AuthService.verifyToken();
          if (response.success && response.data.user) {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
          } else {
            throw new Error('Token verification failed');
          }
        } else {
          // Clear any invalid auth data
          AuthService.clearAuthData();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthService.clearAuthData();
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth events from API interceptors
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

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:forbidden', handleForbidden);
    };
  }, []);

  // Login function
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

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await AuthService.register(userData);
      
      if (response.success && response.data.user) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Update user profile function
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

  // Update password function
  const updatePassword = useCallback(async (passwordData) => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await UserService.updateCurrentUserPassword(passwordData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Password update failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Password update failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete account function
  const deleteAccount = useCallback(async (confirmationEmail) => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      // Validate email confirmation
      if (!confirmationEmail || confirmationEmail !== state.user?.email) {
        throw new Error('Email confirmation does not match your account email');
      }

      const response = await UserService.deleteCurrentUser();
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Account deletion failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Account deletion failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.user?.email]);

  // Refresh user data function
  const refreshUser = useCallback(async () => {
    try {
      const response = await UserService.getCurrentUser();
      
      if (response.success && response.data.user) {
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data.user });
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user && state.user.role === role;
  }, [state.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Get user display name
  const getDisplayName = useCallback(() => {
    return UserService.getDisplayName(state.user);
  }, [state.user]);

  // Get user initials
  const getUserInitials = useCallback(() => {
    return UserService.getUserInitials(state.user);
  }, [state.user]);

  // Context value
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
    updateProfile,
    updatePassword,
    deleteAccount,
    refreshUser,
    clearError,

    // Utility functions
    hasRole,
    isAdmin,
    getDisplayName,
    getUserInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for components that require authentication
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

// HOC for components that require specific roles
export const withRole = (Component, requiredRole) => {
  return function RoleProtectedComponent(props) {
    const { hasRole, isLoading, isAuthenticated } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this content.</div>;
    }
    
    if (!hasRole(requiredRole)) {
      return <div>You don't have permission to access this content.</div>;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;