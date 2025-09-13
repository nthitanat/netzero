// API Response Types
export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// API Error Types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
};

// Standard API Response Structure
export class ApiResponse {
  constructor(data, status = API_STATUS.SUCCESS, message = '', error = null) {
    this.data = data;
    this.status = status;
    this.message = message;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Request successful') {
    return new ApiResponse(data, API_STATUS.SUCCESS, message);
  }

  static error(error, message = 'Request failed') {
    return new ApiResponse(null, API_STATUS.ERROR, message, error);
  }

  static loading(message = 'Loading...') {
    return new ApiResponse(null, API_STATUS.LOADING, message);
  }
}

// Pagination Response Structure
export class PaginatedResponse extends ApiResponse {
  constructor(data, pagination, status = API_STATUS.SUCCESS, message = '') {
    super(data, status, message);
    this.pagination = {
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || 1,
      totalItems: pagination.totalItems || 0,
      itemsPerPage: pagination.itemsPerPage || 10,
      hasNextPage: pagination.hasNextPage || false,
      hasPreviousPage: pagination.hasPreviousPage || false,
    };
  }
}

// API Error Class
export class ApiError extends Error {
  constructor(message, type = API_ERROR_TYPES.SERVER_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  static fromAxiosError(axiosError) {
    const { response, request, message } = axiosError;
    
    if (response) {
      // Server responded with error status
      const statusCode = response.status;
      let type = API_ERROR_TYPES.SERVER_ERROR;
      
      switch (statusCode) {
        case 400:
          type = API_ERROR_TYPES.VALIDATION_ERROR;
          break;
        case 401:
        case 403:
          type = API_ERROR_TYPES.AUTHORIZATION_ERROR;
          break;
        case 404:
          type = API_ERROR_TYPES.NOT_FOUND_ERROR;
          break;
        case 500:
        default:
          type = API_ERROR_TYPES.SERVER_ERROR;
          break;
      }
      
      return new ApiError(
        response.data?.message || message,
        type,
        statusCode,
        response.data
      );
    } else if (request) {
      // Request made but no response received
      return new ApiError(
        'Network error occurred',
        API_ERROR_TYPES.NETWORK_ERROR,
        0,
        { originalMessage: message }
      );
    } else {
      // Error in request configuration
      return new ApiError(
        message,
        API_ERROR_TYPES.NETWORK_ERROR,
        0
      );
    }
  }
}

// API Request Configuration
export const createApiConfig = (options = {}) => ({
  timeout: options.timeout || 10000,
  retries: options.retries || 3,
  retryDelay: options.retryDelay || 1000,
  cache: options.cache || false,
  cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
  ...options,
});

// Cache Management
class ApiCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, data, timeout = 300000) {
    const expirationTime = Date.now() + timeout;
    this.cache.set(key, { data, expirationTime });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expirationTime) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();
