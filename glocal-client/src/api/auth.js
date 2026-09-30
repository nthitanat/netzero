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
