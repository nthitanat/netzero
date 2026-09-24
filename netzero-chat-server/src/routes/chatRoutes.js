const express = require('express');
const ChatController = require('../controllers/ChatController');
const { optionalAuth, chatRateLimit } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateChatId, validateMessage } = require('../validators/chatValidator');

const router = express.Router();
router.use(chatRateLimit);

router.get('/health', asyncHandler(ChatController.getHealthCheck));
router.get('/:chatid', optionalAuth, validateChatId, asyncHandler(ChatController.getChatWelcome));
router.post('/:chatid/message', optionalAuth, validateChatId, validateMessage, asyncHandler(ChatController.sendMessage));

module.exports = router;
