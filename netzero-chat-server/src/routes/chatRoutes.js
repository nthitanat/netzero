const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { authenticateToken, optionalAuth, chatRateLimit } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const validateMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Apply rate limiting to all chat routes
router.use(chatRateLimit);

// Health check endpoint (no auth required)
router.get('/health', ChatController.getHealthCheck);

// Chat endpoints with optional authentication
// GET /api/v1/chat/:chatid - Get chat welcome message
router.get('/:chatid', optionalAuth, ChatController.getChatWelcome);

// POST /api/v1/chat/:chatid/message - Send message to chat
router.post('/:chatid/message', optionalAuth, validateMessage, ChatController.sendMessage);

module.exports = router;