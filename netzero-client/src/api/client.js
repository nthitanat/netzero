import axios from 'axios';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://161.200.199.67/node/',
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
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    });
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      // Handle unauthorized access without hard redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    if (error.response?.status === 500) {
      // Server error - show user-friendly message
      console.error('Server error occurred. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axiosInstance };
