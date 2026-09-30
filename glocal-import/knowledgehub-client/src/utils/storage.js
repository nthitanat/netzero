class StorageService {
  constructor() {
    this.authKeys = {
      TOKEN: 'authToken',
      USER_DATA: 'userData',
    };
  }

  // ── Auth helpers ──────────────────────────────────────────

  getAuthToken() {
    return this.getItem(this.authKeys.TOKEN);
  }

  setAuthToken(token) {
    this.setItem(this.authKeys.TOKEN, token);
  }

  removeAuthToken() {
    this.removeItem(this.authKeys.TOKEN);
  }

  getUserData() {
    return this.getJSON(this.authKeys.USER_DATA);
  }

  setUserData(userData) {
    this.setJSON(this.authKeys.USER_DATA, userData);
  }

  removeUserData() {
    this.removeItem(this.authKeys.USER_DATA);
  }

  /** Call after successful login / register */
  saveAuthData(token, userData) {
    this.setAuthToken(token);
    this.setUserData(userData);
  }

  /** Call on logout or 401 */
  clearAuthData() {
    this.removeAuthToken();
    this.removeUserData();
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // ── Generic localStorage utilities ───────────────────────

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // silent
    }
  }

  getJSON(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setJSON(key, value) {
    this.setItem(key, JSON.stringify(value));
  }
}

export const storageService = new StorageService();
