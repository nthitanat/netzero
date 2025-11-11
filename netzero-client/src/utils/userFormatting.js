/**
 * User Data Formatting Utilities
 * Pure functions for formatting user data for display
 */

/**
 * Get user's display name
 * @param {Object} user - User object
 * @returns {string} Formatted display name
 */
export const getDisplayName = (user) => {
  if (!user) return 'Guest';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
};

/**
 * Get user's initials for avatar display
 * @param {Object} user - User object
 * @returns {string} User initials (1-2 characters)
 */
export const getUserInitials = (user) => {
  if (!user) return 'G';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.firstName) return user.firstName[0].toUpperCase();
  if (user.lastName) return user.lastName[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  
  return 'U';
};

/**
 * Get localized role display name
 * @param {string} role - User role
 * @returns {string} Localized role name
 */
export const getRoleDisplayName = (role) => {
  const roleMap = {
    'buyer': 'ผู้ซื้อ',
    'seller': 'ผู้ขาย',
    'community_head': 'หัวหน้าชุมชน',
    'admin': 'ผู้ดูแลระบบ'
  };
  
  return roleMap[role] || 'ไม่ระบุ';
};

/**
 * Check if user profile is complete
 * @param {Object} user - User object
 * @returns {boolean} True if profile has all required fields
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  
  return !!(
    user.firstName &&
    user.lastName &&
    user.email &&
    user.phoneNumber &&
    user.address
  );
};

/**
 * Format user's full address
 * @param {Object} user - User object
 * @returns {string} Formatted address or placeholder
 */
export const getFormattedAddress = (user) => {
  if (!user || !user.address) return 'Not provided';
  return user.address;
};

/**
 * Get user's email domain
 * @param {Object} user - User object
 * @returns {string} Email domain or empty string
 */
export const getEmailDomain = (user) => {
  if (!user || !user.email) return '';
  const parts = user.email.split('@');
  return parts.length === 2 ? parts[1] : '';
};

/**
 * Check if user has profile image
 * @param {Object} user - User object
 * @returns {boolean} True if user has profile image URL
 */
export const hasProfileImage = (user) => {
  return !!(user && user.profileImage && user.profileImage.trim() !== '');
};
