const express = require('express');
const router = express.Router();
const ChatAppController = require('../controllers/ChatAppController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const validateChatAppCreate = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid positive integer'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'closed', 'archived'])
    .withMessage('Status must be one of: active, closed, archived')
];

const validateChatAppUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'closed', 'archived'])
    .withMessage('Status must be one of: active, closed, archived')
];

// Public routes (no authentication required)

// GET /api/v1/chatapps - Get all chat applications with optional filters
router.get('/', ChatAppController.getAllChatApps);

// GET /api/v1/chatapps/statistics - Get chat statistics
router.get('/statistics', ChatAppController.getChatStatistics);

// GET /api/v1/chatapps/my - Get current user's chat applications (must be before /:id route)
router.get('/my', authenticateToken, ChatAppController.getMyChatApps);

// GET /api/v1/chatapps/:id - Get chat application by ID (must be after specific routes)
router.get('/:id', ChatAppController.getChatAppById);

// Protected routes (authentication required)

// POST /api/v1/chatapps - Create a new chat application
router.post('/', authenticateToken, validateChatAppCreate, ChatAppController.createChatApp);

// PUT /api/v1/chatapps/:id - Update chat application (only by owner or admin)
router.put('/:id', authenticateToken, validateChatAppUpdate, ChatAppController.updateChatApp);

// DELETE /api/v1/chatapps/:id - Delete chat application (only by owner or admin)
router.delete('/:id', authenticateToken, ChatAppController.deleteChatApp);

module.exports = router;
