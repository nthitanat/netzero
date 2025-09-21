const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken, authRateLimit } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  authRateLimit,
  validateRegistration,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', 
  authRateLimit,
  validateLogin,
  AuthController.login
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and return user data
 * @access  Private
 */
router.get('/verify', 
  authenticateToken,
  AuthController.verifyToken
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', 
  authenticateToken,
  AuthController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (for token blacklisting if implemented)
 * @access  Private
 */
router.post('/logout', 
  authenticateToken,
  AuthController.logout
);

module.exports = router;