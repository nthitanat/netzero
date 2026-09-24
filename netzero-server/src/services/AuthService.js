const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_ROLE = 'user';

function signToken(user) {
  return jwt.sign({
    userId: user.userId,
    email: user.email,
    role: user.role
  }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

async function requireActiveUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw applicationError('UNAUTHORIZED', 'User not found');
  return user;
}

async function register({ data }) {
  if (await User.emailExists(data.email)) {
    throw applicationError('CONFLICT', 'User with this email already exists');
  }
  const passwordHash = await bcrypt.hash(data.password, config.auth.bcryptSaltRounds);
  let userId;
  try {
    userId = await User.insert({
      ...data,
      passwordHash,
      role: DEFAULT_ROLE
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw applicationError('CONFLICT', 'User with this email already exists', { cause: error });
    }
    throw error;
  }
  const user = await requireActiveUser(userId);
  return { token: signToken(user), user };
}

async function login({ email, password }) {
  const userWithPassword = await User.findByEmail(email);
  if (!userWithPassword || !await bcrypt.compare(password, userWithPassword.passwordHash)) {
    throw applicationError('UNAUTHORIZED', 'Invalid email or password');
  }
  await User.updateLastLogin(userWithPassword.userId);
  const { passwordHash, ...user } = userWithPassword;
  return { token: signToken(user), user };
}

async function verifyToken({ actor }) {
  return requireActiveUser(actor.userId ?? actor.id);
}

async function refreshToken({ actor }) {
  const user = await requireActiveUser(actor.userId ?? actor.id);
  return { token: signToken(user), user };
}

function logout() {
  return true;
}

module.exports = { register, login, verifyToken, refreshToken, logout };
