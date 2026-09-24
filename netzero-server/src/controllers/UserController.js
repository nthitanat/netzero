const UserService = require('../services/UserService');
const { serializeUser } = require('./userSerializer');
const { sendSuccess } = require('../middleware/response');

async function getUserById(req, res) {
  const user = await UserService.getUserById({
    actor: req.user,
    userId: req.validated.params.id
  });
  return sendSuccess(res, { message: 'User retrieved successfully', data: { user: serializeUser(user) } });
}

async function getAllUsers(req, res) {
  const result = await UserService.listUsers({
    actor: req.user,
    page: req.validated.query.page,
    limit: req.validated.query.limit
  });
  return sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: {
      users: result.users.map(serializeUser),
      pagination: result.pagination
    }
  });
}

async function updateUser(req, res) {
  const user = await UserService.updateUser({
    actor: req.user,
    userId: req.validated.params.id,
    updates: req.validated.body
  });
  return sendSuccess(res, { message: 'User updated successfully', data: { user: serializeUser(user) } });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body;
  await UserService.updatePassword({
    actor: req.user,
    userId: req.validated.params.id,
    currentPassword,
    newPassword
  });
  return sendSuccess(res, { message: 'Password updated successfully' });
}

async function deleteUser(req, res) {
  await UserService.deleteUser({ actor: req.user, userId: req.validated.params.id });
  return sendSuccess(res, { message: 'User deleted successfully' });
}

async function getCurrentUser(req, res) {
  const user = await UserService.getCurrentUser({ actor: req.user });
  return sendSuccess(res, { message: 'Current user retrieved successfully', data: { user: serializeUser(user) } });
}

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  getCurrentUser
};
