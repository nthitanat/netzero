const express = require('express');
const UserController = require('../controllers/UserController');
const { 
  authenticateToken, 
  authorizeRoles, 
  authorizeOwnerOrAdmin,
  validateUserIdParam 
} = require('../middleware/auth');
const { 
  validateUserUpdate, 
  validatePasswordUpdate 
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', 
  authenticateToken,
  UserController.getCurrentUser
);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin only)
 */
router.get('/', 
  authenticateToken,
  authorizeRoles('admin'),
  UserController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (own profile or admin)
 * @access  Private (Owner or Admin)
 */
router.get('/:id', 
  authenticateToken,
  validateUserIdParam,
  authorizeOwnerOrAdmin,
  UserController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile (own profile or admin)
 * @access  Private (Owner or Admin)
 */
router.put('/:id', 
  authenticateToken,
  validateUserIdParam,
  authorizeOwnerOrAdmin,
  validateUserUpdate,
  UserController.updateUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password (own password or admin)
 * @access  Private (Owner or Admin)
 */
router.put('/:id/password', 
  authenticateToken,
  validateUserIdParam,
  authorizeOwnerOrAdmin,
  validatePasswordUpdate,
  UserController.updatePassword
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account (soft delete - own account or admin)
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', 
  authenticateToken,
  validateUserIdParam,
  authorizeOwnerOrAdmin,
  UserController.deleteUser
);

module.exports = router;