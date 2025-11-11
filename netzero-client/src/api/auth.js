import { axiosInstance } from './client';
import { storageService } from '../utils/storage';

class AuthService {
  constructor() {
    // Authentication endpoints
    this.endpoints = {
      REGISTER: '/api/v1/auth/register',
      LOGIN: '/api/v1/auth/login',
      VERIFY: '/api/v1/auth/verify',
      REFRESH: '/api/v1/auth/refresh',
      LOGOUT: '/api/v1/auth/logout'
    };
    
    // Keep these for backward compatibility with client.js
    this.tokenKey = storageService.authKeys.TOKEN;
    this.userDataKey = storageService.authKeys.USER_DATA;
  }

  // Register new user
  async register(userData) {
    try {
      const response = await axiosInstance.post(this.endpoints.REGISTER, userData);
      
      if (response.data.success && response.data.data.token) {
        // Store auth data using centralized storage
        storageService.saveAuthData(
          response.data.data.token,
          response.data.data.user
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await axiosInstance.post(this.endpoints.LOGIN, credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store auth data using centralized storage
        storageService.saveAuthData(
          response.data.data.token,
          response.data.data.user
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await axiosInstance.get(this.endpoints.VERIFY);
      
      if (response.data.success && response.data.data.user) {
        // Update stored user data using centralized storage
        storageService.setUserData(response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      // Clear invalid token
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.post(this.endpoints.REFRESH, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data.token) {
        // Update stored token and user data using centralized storage
        storageService.saveAuthData(
          response.data.data.token,
          response.data.data.user
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid token
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call logout endpoint (optional for token blacklisting)
        await axiosInstance.post(this.endpoints.LOGOUT, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Clear stored auth data
      this.clearAuthData();
      
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear auth data even if logout request fails
      this.clearAuthData();
      return { success: true, message: 'Logout completed' };
    }
  }

  // Get stored authentication token
  getToken() {
    return storageService.getAuthToken();
  }

  // Get stored user data
  getUserData() {
    return storageService.getUserData();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return storageService.isAuthenticated() && !!this.getUserData();
  }

  // Check if user has specific role
  hasRole(role) {
    const userData = this.getUserData();
    return userData && userData.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Clear all authentication data
  clearAuthData() {
    storageService.clearAuthData();
  }

  // Set authentication data (for external use)
  setAuthData(token, userData) {
    storageService.saveAuthData(token, userData);
  }

  // Handle authentication errors
  handleAuthError(error) {
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

  // Get authentication headers
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check token expiration (basic check)
  isTokenExpired() {
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
}

// Export singleton instance as default and named export
export const authService = new AuthService();
export default authService;