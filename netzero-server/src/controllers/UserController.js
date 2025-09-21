const User = require('../models/User');

class UserController {
  // Get user by ID
  static async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;

      // Validate user ID
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Check permissions: user can access their own data or admin can access any user data
      if (userId !== requestingUserId && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own profile'
        });
      }

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user'
      });
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const requestingUserRole = req.user.role;

      // Check if user is admin
      if (requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Get users with pagination
      const users = await User.getAll(limit, offset);
      const totalCount = await User.getTotalCount();
      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving users'
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;
      const { firstName, lastName, profileImage, phoneNumber, address } = req.body;

      // Validate user ID
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Check permissions: user can update their own data or admin can update any user data
      if (userId !== requestingUserId && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own profile'
        });
      }

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required'
        });
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user
      const updateSuccess = await User.updateById(userId, {
        firstName,
        lastName,
        profileImage,
        phoneNumber,
        address
      });

      if (!updateSuccess) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update user'
        });
      }

      // Get updated user data
      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating user'
      });
    }
  }

  // Update password
  static async updatePassword(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;
      const { currentPassword, newPassword } = req.body;

      // Validate user ID
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Check permissions: user can update their own password or admin can update any user password
      if (userId !== requestingUserId && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own password'
        });
      }

      // Validate required fields
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // For non-admin users, verify current password
      if (requestingUserRole !== 'admin') {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required'
          });
        }

        const user = await User.findByIdWithPassword(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        const isCurrentPasswordValid = await User.validatePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
      }

      // Update password
      const updateSuccess = await User.updatePassword(userId, newPassword);

      if (!updateSuccess) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update password'
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating password'
      });
    }
  }

  // Delete user (soft delete)
  static async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;

      // Validate user ID
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Check permissions: user can delete their own account or admin can delete any user account
      if (userId !== requestingUserId && requestingUserRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own account'
        });
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deleting themselves
      if (userId === requestingUserId && requestingUserRole === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Admin cannot delete their own account'
        });
      }

      // Soft delete user
      const deleteSuccess = await User.softDelete(userId);

      if (!deleteSuccess) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete user'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting user'
      });
    }
  }

  // Get current user profile
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Current user retrieved successfully',
        data: {
          user
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving current user'
      });
    }
  }
}

module.exports = UserController;