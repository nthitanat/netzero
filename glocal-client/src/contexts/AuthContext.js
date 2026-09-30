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
