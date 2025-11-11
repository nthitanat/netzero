/**
 * Utils Index
 * Centralized exports for utility functions
 */

// Authentication validation utilities
export {
  validateEmail,
  validatePassword,
  isPasswordStrong,
  getPasswordStrength
} from './authValidation';

// User data formatting utilities
export {
  getDisplayName,
  getUserInitials,
  getRoleDisplayName,
  isProfileComplete,
  getFormattedAddress,
  getEmailDomain,
  hasProfileImage
} from './userFormatting';

// Storage utilities (localStorage management)
export { storageService } from './storage';

