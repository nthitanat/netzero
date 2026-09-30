import axios from 'axios';
import { storageService } from '../utils/storage';

const BASE_URL = 'https://engagement.chula.ac.th/netzero-api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storageService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Clear stale token and tell AuthContext to log out
      storageService.clearAuthData();
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: {
          message: error.response?.data?.message || 'Authentication required',
        },
      }));
    }

    if (status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: {
          message: error.response?.data?.message || 'Access denied',
        },
      }));
    }

    return Promise.reject(error);
  }
);
