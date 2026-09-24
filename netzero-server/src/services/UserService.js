const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/env');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.userPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function assertCanAccess(actor, userId) {
  if (actor.role !== 'admin' && actorId(actor) !== userId) {
    throw applicationError('FORBIDDEN', 'Access denied. You can only access your own profile');
  }
}

async function requireUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw applicationError('NOT_FOUND', 'User not found');
  return user;
}

async function getUserById({ actor, userId }) {
  assertCanAccess(actor, userId);
  return requireUser(userId);
}

async function getCurrentUser({ actor }) {
  return requireUser(actorId(actor));
}

async function listUsers({ actor, page = 1, limit = DEFAULT_PAGE_SIZE }) {
  if (actor.role !== 'admin') throw applicationError('FORBIDDEN', 'Access denied. Admin privileges required');
  const pageSize = Math.min(limit, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const [users, totalCount] = await Promise.all([
    User.findAll({ limit: pageSize, offset }),
    User.countActive()
  ]);
  return {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      limit: pageSize
    }
  };
}

async function updateUser({ actor, userId, updates }) {
  assertCanAccess(actor, userId);
  await requireUser(userId);
  const didUpdate = await User.updateById(userId, updates);
  if (!didUpdate) throw applicationError('VALIDATION', 'Failed to update user');
  return requireUser(userId);
}

async function updatePassword({ actor, userId, currentPassword, newPassword }) {
  assertCanAccess(actor, userId);
  if (actor.role !== 'admin') {
    if (!currentPassword) throw applicationError('VALIDATION', 'Current password is required');
    const user = await User.findById(userId, { includePassword: true });
    if (!user) throw applicationError('NOT_FOUND', 'User not found');
    if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
      throw applicationError('UNAUTHORIZED', 'Current password is incorrect');
    }
  } else {
    await requireUser(userId);
  }
  const passwordHash = await bcrypt.hash(newPassword, config.auth.bcryptSaltRounds);
  const didUpdate = await User.updatePasswordHash(userId, passwordHash);
  if (!didUpdate) throw applicationError('VALIDATION', 'Failed to update password');
}

async function deleteUser({ actor, userId }) {
  assertCanAccess(actor, userId);
  await requireUser(userId);
  if (actor.role === 'admin' && actorId(actor) === userId) {
    throw applicationError('VALIDATION', 'Admin cannot delete their own account');
  }
  const didDelete = await User.deactivate(userId);
  if (!didDelete) throw applicationError('VALIDATION', 'Failed to delete user');
}

module.exports = {
  getUserById,
  getCurrentUser,
  listUsers,
  updateUser,
  updatePassword,
  deleteUser
};
