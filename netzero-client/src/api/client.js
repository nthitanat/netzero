import axios from 'axios';

// Determine base URL based on environment
const getBaseURL = () => {
  // Environment variables are injected at build time by Docker
  // They come from the .env file via docker-compose
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Fallback to localhost for local development
  return 'https://engagement.chula.ac.th/netzero-api/';
};

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
    
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      duration: `${duration}ms`,
      data: response.data,
    });
    
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = error.config?.metadata ? 
      endTime.getTime() - error.config.metadata.startTime.getTime() : 0;
    
    const errorDetails = {
      status: error.response?.status,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    };
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('Error Details:', errorDetails);
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data and dispatch event
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: { 
          message: error.response?.data?.message || 'Authentication required',
          originalUrl: error.config?.url
        }
      }));
    }
    
    if (error.response?.status === 403) {
      // Forbidden - dispatch event for handling
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: {
          message: error.response?.data?.message || 'Access denied',
          originalUrl: error.config?.url
        }
      }));
    }
    
    if (error.response?.status === 500) {
      // Server error - show user-friendly message
      console.error('Server error occurred. Please try again later.');
      window.dispatchEvent(new CustomEvent('api:serverError', {
        detail: {
          message: 'Server error occurred. Please try again later.',
          originalUrl: error.config?.url
        }
      }));
    }
    
    // Handle network errors (server not reachable)
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.error('⚠️ Network Error: Cannot reach server. Please check if the server is running.');
      window.dispatchEvent(new CustomEvent('api:networkError', {
        detail: {
          message: 'Cannot reach server. Please check your connection or contact support.',
          originalUrl: error.config?.url
        }
      }));
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axiosInstance };
