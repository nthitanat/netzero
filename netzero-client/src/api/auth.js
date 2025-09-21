import { axiosInstance } from './client';

// Authentication endpoints
const AUTH_ENDPOINTS = {
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  VERIFY: '/api/v1/auth/verify',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout'
};

class AuthService {
  // Register new user
  static async register(userData) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
      
      if (response.data.success && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Login user
  static async login(credentials) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Verify token
  static async verifyToken() {
    try {
      const response = await axiosInstance.get(AUTH_ENDPOINTS.VERIFY);
      
      if (response.data.success && response.data.data.user) {
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
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
  static async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data.token) {
        // Update stored token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
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
  static async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call logout endpoint (optional for token blacklisting)
        await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT, {}, {
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
  static getToken() {
    return localStorage.getItem('authToken');
  }

  // Get stored user data
  static getUserData() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken();
    const userData = this.getUserData();
    return !!(token && userData);
  }

  // Check if user has specific role
  static hasRole(role) {
    const userData = this.getUserData();
    return userData && userData.role === role;
  }

  // Check if user is admin
  static isAdmin() {
    return this.hasRole('admin');
  }

  // Clear all authentication data
  static clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  // Set authentication data (for external use)
  static setAuthData(token, userData) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  // Handle authentication errors
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

  // Get authentication headers
  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
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

  // Check token expiration (basic check)
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
}

export default AuthService;