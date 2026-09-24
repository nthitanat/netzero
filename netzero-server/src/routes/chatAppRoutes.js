const express = require('express');
const ChatAppController = require('../controllers/ChatAppController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  chatIdParams,
  chatAppFilters,
  statisticsQuery,
  pageQuery,
  createChatAppBody,
  updateChatAppBody
} = require('../validators/chatAppValidator');

const router = express.Router();

router.get('/', validateRequest({ query: chatAppFilters }), asyncHandler(ChatAppController.getAllChatApps));
router.get('/statistics', optionalAuth, validateRequest({ query: statisticsQuery }), asyncHandler(ChatAppController.getChatStatistics));
router.get('/my', authenticateToken, validateRequest({ query: pageQuery }), asyncHandler(ChatAppController.getMyChatApps));
router.get('/:id', validateRequest({ params: chatIdParams }), asyncHandler(ChatAppController.getChatAppById));
router.post('/', authenticateToken, validateRequest({ body: createChatAppBody }), asyncHandler(ChatAppController.createChatApp));
router.put('/:id', authenticateToken, validateRequest({ params: chatIdParams, body: updateChatAppBody }), asyncHandler(ChatAppController.updateChatApp));
router.delete('/:id', authenticateToken, validateRequest({ params: chatIdParams }), asyncHandler(ChatAppController.deleteChatApp));

module.exports = router;
