const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  userIdParams,
  userListQuery,
  updateUserBody,
  updatePasswordBody
} = require('../validators/userValidator');

const router = express.Router();

router.get('/me', authenticateToken, asyncHandler(UserController.getCurrentUser));
router.get('/', authenticateToken, authorizeRoles('admin'), validateRequest({ query: userListQuery }), asyncHandler(UserController.getAllUsers));
router.get('/:id', authenticateToken, validateRequest({ params: userIdParams }), asyncHandler(UserController.getUserById));
router.put('/:id', authenticateToken, validateRequest({ params: userIdParams, body: updateUserBody }), asyncHandler(UserController.updateUser));
router.put('/:id/password', authenticateToken, validateRequest({ params: userIdParams, body: updatePasswordBody }), asyncHandler(UserController.updatePassword));
router.delete('/:id', authenticateToken, validateRequest({ params: userIdParams }), asyncHandler(UserController.deleteUser));

module.exports = router;
