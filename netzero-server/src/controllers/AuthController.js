const AuthService = require('../services/AuthService');
const { serializeUser } = require('./userSerializer');
const { sendSuccess } = require('../middleware/response');

async function register(req, res) {
  const { token, user } = await AuthService.register({ data: req.validated.body });
  return sendSuccess(res, {
    message: 'User registered successfully',
    data: { token, user: serializeUser(user) },
    statusCode: 201
  });
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const result = await AuthService.login({ email, password });
  return sendSuccess(res, {
    message: 'Login successful',
    data: { token: result.token, user: serializeUser(result.user) }
  });
}

async function verifyToken(req, res) {
  const user = await AuthService.verifyToken({ actor: req.user });
  return sendSuccess(res, { message: 'Token is valid', data: { user: serializeUser(user) } });
}

function logout(req, res) {
  AuthService.logout();
  return sendSuccess(res, { message: 'Logout successful' });
}

async function refreshToken(req, res) {
  const { token, user } = await AuthService.refreshToken({ actor: req.user });
  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: { token, user: serializeUser(user) }
  });
}

module.exports = { register, login, verifyToken, logout, refreshToken };
