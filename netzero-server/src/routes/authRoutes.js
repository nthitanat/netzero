const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const { registerBody, loginBody } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', authLimiter, validateRequest({ body: registerBody }), asyncHandler(AuthController.register));
router.post('/login', authLimiter, validateRequest({ body: loginBody }), asyncHandler(AuthController.login));
router.get('/verify', authenticateToken, asyncHandler(AuthController.verifyToken));
router.post('/refresh', authenticateToken, asyncHandler(AuthController.refreshToken));
router.post('/logout', authenticateToken, asyncHandler(AuthController.logout));

module.exports = router;
