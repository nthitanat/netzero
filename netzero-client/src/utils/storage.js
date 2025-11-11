/**
 * Centralized localStorage management utility
 * Provides type-safe, consistent access to localStorage with error handling
 */

class StorageService {
  constructor() {
    // Auth storage keys - centralized key naming
    this.authKeys = {
      TOKEN: 'authToken',
      USER_DATA: 'userData',
    };
  }

  // ==================== Auth Storage ====================
  
  /**
   * Get authentication token
   * @returns {string|null}
   */
  getAuthToken() {
    return this.getItem(this.authKeys.TOKEN);
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.setItem(this.authKeys.TOKEN, token);
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    this.removeItem(this.authKeys.TOKEN);
  }

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUserData() {
    return this.getJSON(this.authKeys.USER_DATA);
  }

  /**
   * Set user data
   * @param {Object} userData - User data object
   */
  setUserData(userData) {
    this.setJSON(this.authKeys.USER_DATA, userData);
  }

  /**
   * Remove user data
   */
  removeUserData() {
    this.removeItem(this.authKeys.USER_DATA);
  }

  /**
   * Save complete auth data (token + user)
   * @param {string} token - JWT token
   * @param {Object} userData - User data object
   */
  saveAuthData(token, userData) {
    this.setAuthToken(token);
    this.setUserData(userData);
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    this.removeAuthToken();
    this.removeUserData();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // ==================== General Storage Utilities ====================

  /**
   * Safely get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*}
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch (error) {
      console.error(`Error getting item "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item "${key}":`, error);
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  /**
   * Safely remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item "${key}":`, error);
      throw new Error(`Failed to remove item: ${key}`);
    }
  }

  /**
   * Get JSON data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or parse fails
   * @returns {*}
   */
  getJSON(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error parsing JSON for "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set JSON data in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   */
  setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting JSON for "${key}":`, error);
      throw new Error(`Failed to store JSON: ${key}`);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
