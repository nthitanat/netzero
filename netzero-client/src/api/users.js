import { axiosInstance } from './client';
import { authService } from './auth';
import { storageService } from '../utils/storage';

class UserService {
  constructor() {
    // User endpoints
    this.endpoints = {
      GET_CURRENT_USER: '/api/v1/users/me',
      GET_ALL_USERS: '/api/v1/users',
      GET_USER_BY_ID: (id) => `/api/v1/users/${id}`,
      UPDATE_USER: (id) => `/api/v1/users/${id}`,
      UPDATE_PASSWORD: (id) => `/api/v1/users/${id}/password`,
      DELETE_USER: (id) => `/api/v1/users/${id}`
    };
    
    // Keep for backward compatibility
    this.userDataKey = storageService.authKeys.USER_DATA;
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.get(this.endpoints.GET_CURRENT_USER, { headers });
      
      if (response.data.success && response.data.data.user) {
        // Update stored user data using centralized storage
        storageService.setUserData(response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw this.handleUserError(error);
    }
  }

  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 20) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.get(this.endpoints.GET_ALL_USERS, {
        headers,
        params: { page, limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw this.handleUserError(error);
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.get(this.endpoints.GET_USER_BY_ID(userId), { headers });
      
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw this.handleUserError(error);
    }
  }

  // Update user profile
  async updateUser(userId, userData) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.put(this.endpoints.UPDATE_USER(userId), userData, { headers });
      
      // If updating current user, update stored data using centralized storage
      const currentUser = authService.getUserData();
      if (currentUser && currentUser.id === parseInt(userId)) {
        storageService.setUserData(response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw this.handleUserError(error);
    }
  }

  // Update user password
  async updatePassword(userId, passwordData) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.put(
        this.endpoints.UPDATE_PASSWORD(userId), 
        passwordData, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw this.handleUserError(error);
    }
  }

  // Delete user account (soft delete)
  async deleteUser(userId) {
    try {
      const headers = authService.getAuthHeaders();
      const response = await axiosInstance.delete(this.endpoints.DELETE_USER(userId), { headers });
      
      // If deleting current user, clear auth data
      const currentUser = authService.getUserData();
      if (currentUser && currentUser.id === parseInt(userId)) {
        authService.clearAuthData();
      }
      
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw this.handleUserError(error);
    }
  }

  // Update current user profile (convenience method)
  async updateCurrentUser(userData) {
    const currentUser = authService.getUserData();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    return this.updateUser(currentUser.id, userData);
  }

  // Update current user password (convenience method)
  async updateCurrentUserPassword(passwordData) {
    const currentUser = authService.getUserData();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    return this.updatePassword(currentUser.id, passwordData);
  }

  // Delete current user account (convenience method)
  async deleteCurrentUser() {
    const currentUser = authService.getUserData();
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    return this.deleteUser(currentUser.id);
  }

  // Check if current user can access a specific user's data
  canAccessUser(userId) {
    const currentUser = authService.getUserData();
    if (!currentUser) return false;
    
    // User can access their own data or admin can access any user data
    return currentUser.id === parseInt(userId) || currentUser.role === 'admin';
  }

  // Check if current user can modify a specific user's data
  canModifyUser(userId) {
    return this.canAccessUser(userId); // Same logic for now
  }

  // Validate user data
  validateUserData(userData) {
    const errors = [];
    
    if (userData.firstName) {
      if (userData.firstName.length < 2 || userData.firstName.length > 50) {
        errors.push('First name must be between 2 and 50 characters');
      }
      if (!/^[a-zA-Z\s]+$/.test(userData.firstName)) {
        errors.push('First name can only contain letters and spaces');
      }
    }
    
    if (userData.lastName) {
      if (userData.lastName.length < 2 || userData.lastName.length > 50) {
        errors.push('Last name must be between 2 and 50 characters');
      }
      if (!/^[a-zA-Z\s]+$/.test(userData.lastName)) {
        errors.push('Last name can only contain letters and spaces');
      }
    }
    
    if (userData.phoneNumber) {
      // Basic phone number validation (you might want to use a library for this)
      if (!/^\+?[\d\s\-\(\)]+$/.test(userData.phoneNumber)) {
        errors.push('Please provide a valid phone number');
      }
    }
    
    if (userData.address && userData.address.length > 500) {
      errors.push('Address cannot exceed 500 characters');
    }
    
    if (userData.profileImage) {
      try {
        new URL(userData.profileImage);
      } catch {
        errors.push('Profile image must be a valid URL');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate password data
  validatePasswordData(passwordData) {
    const errors = [];
    
    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }
    
    if (!passwordData.newPassword) {
      errors.push('New password is required');
    }
    
    if (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New password and confirmation do not match');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Handle user service errors
  handleUserError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear auth data
        authService.clearAuthData();
      }
      
      return {
        message: data.message || 'User service error',
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

  // Format user display name
  getDisplayName(user) {
    if (!user) return 'Unknown User';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return user.email || 'Unknown User';
    }
  }

  // Get user initials for avatar
  getUserInitials(user) {
    if (!user) return 'UU';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  }

  // Check if user profile is complete
  isProfileComplete(user) {
    if (!user) return false;
    
    return !!(
      user.firstName &&
      user.lastName &&
      user.email &&
      user.phoneNumber
    );
  }

  // Get user role display name
  getRoleDisplayName(role) {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'User';
      default:
        return 'Unknown Role';
    }
  }
}

// Export singleton instance as default and named export
export const userService = new UserService();
export default userService;