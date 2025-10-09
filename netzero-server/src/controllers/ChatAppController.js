const ChatApp = require('../models/ChatApp');
const { validationResult } = require('express-validator');

class ChatAppController {
  
  // GET /api/v1/chatapps - Get all chat applications
  static async getAllChatApps(req, res) {
    try {
      const filters = {};

      // Only add filters if they have valid values
      if (req.query.owner_id && req.query.owner_id !== 'undefined' && req.query.owner_id !== '') {
        filters.owner_id = req.query.owner_id;
      }

      if (req.query.product_id && req.query.product_id !== 'undefined' && req.query.product_id !== '') {
        filters.product_id = req.query.product_id;
      }

      if (req.query.status && req.query.status !== 'undefined' && req.query.status !== '' && req.query.status !== 'all') {
        filters.status = req.query.status;
      }

      if (req.query.limit && req.query.limit !== 'undefined' && req.query.limit !== '') {
        filters.limit = req.query.limit;
      }

      const chatApps = await ChatApp.getAll(filters);

      res.status(200).json({
        success: true,
        message: 'Chat applications retrieved successfully',
        data: chatApps.map(chatApp => chatApp.toJSON ? chatApp.toJSON() : chatApp),
        count: chatApps.length,
        filters: filters,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error getting chat applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat applications',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/chatapps/:id - Get chat application by ID
  static async getChatAppById(req, res) {
    try {
      const { id } = req.params;
      const chatApp = await ChatApp.getById(id);

      if (!chatApp) {
        res.locals.error = {
          message: 'Chat application not found',
          chatId: id
        };
        res.status(404);
        return;
      }

      res.locals.data = { chatApp };
      res.locals.message = 'Chat application retrieved successfully';
      
    } catch (error) {
      console.error('❌ Error getting chat application by ID:', error);
      res.locals.error = {
        message: 'Failed to retrieve chat application',
        details: error.message
      };
      res.status(500);
    }
  }

  // GET /api/v1/chatapps/my - Get current user's chat applications
  static async getMyChatApps(req, res) {
    try {
      const userId = req.user.id;
      const chatApps = await ChatApp.getByUserId(userId);

      res.locals.data = {
        chatApps,
        count: chatApps.length,
        userId: userId
      };

      res.locals.message = 'User chat applications retrieved successfully';
      
    } catch (error) {
      console.error('❌ Error getting user chat applications:', error);
      res.locals.error = {
        message: 'Failed to retrieve your chat applications',
        details: error.message
      };
      res.status(500);
    }
  }

  // POST /api/v1/chatapps - Create new chat application
  static async createChatApp(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.locals.error = {
          message: 'Validation failed',
          errors: errors.array()
        };
        res.status(400);
        return;
      }

      const { product_id, title, description, status } = req.body;
      
      const chatApp = new ChatApp({
        owner_id: req.user.id,
        product_id,
        title,
        description,
        status: status || 'active'
      });

      const newChatApp = await chatApp.create();

      res.locals.data = { chatApp: newChatApp };
      res.locals.message = 'Chat application created successfully';
      res.status(201);
      
    } catch (error) {
      console.error('❌ Error creating chat application:', error);
      res.locals.error = {
        message: 'Failed to create chat application',
        details: error.message
      };
      res.status(500);
    }
  }

  // PUT /api/v1/chatapps/:id - Update chat application
  static async updateChatApp(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.locals.error = {
          message: 'Validation failed',
          errors: errors.array()
        };
        res.status(400);
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Check if user owns the chat application or is admin
      const isOwner = await ChatApp.isOwner(id, userId);
      if (!isOwner && req.user.role !== 'admin') {
        res.locals.error = {
          message: 'Access denied. You can only update your own chat applications.'
        };
        res.status(403);
        return;
      }

      const chatApp = await ChatApp.getById(id);
      if (!chatApp) {
        res.locals.error = {
          message: 'Chat application not found',
          chatId: id
        };
        res.status(404);
        return;
      }

      const { title, description, status } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;

      const updatedChatApp = await chatApp.update(updateData);

      res.locals.data = { chatApp: updatedChatApp };
      res.locals.message = 'Chat application updated successfully';
      
    } catch (error) {
      console.error('❌ Error updating chat application:', error);
      res.locals.error = {
        message: 'Failed to update chat application',
        details: error.message
      };
      res.status(500);
    }
  }

  // DELETE /api/v1/chatapps/:id - Delete chat application
  static async deleteChatApp(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user owns the chat application or is admin
      const isOwner = await ChatApp.isOwner(id, userId);
      if (!isOwner && req.user.role !== 'admin') {
        res.locals.error = {
          message: 'Access denied. You can only delete your own chat applications.'
        };
        res.status(403);
        return;
      }

      const chatApp = await ChatApp.getById(id);
      if (!chatApp) {
        res.locals.error = {
          message: 'Chat application not found',
          chatId: id
        };
        res.status(404);
        return;
      }

      await chatApp.delete();

      res.locals.data = { 
        chatId: id,
        deleted: true 
      };
      res.locals.message = 'Chat application deleted successfully';
      
    } catch (error) {
      console.error('❌ Error deleting chat application:', error);
      res.locals.error = {
        message: 'Failed to delete chat application',
        details: error.message
      };
      res.status(500);
    }
  }

  // GET /api/v1/chatapps/statistics - Get chat statistics
  static async getChatStatistics(req, res) {
    try {
      const userId = req.query.user_id || (req.user.role !== 'admin' ? req.user.id : null);
      const statistics = await ChatApp.getStatistics(userId);

      res.locals.data = { 
        statistics,
        scope: userId ? 'user' : 'global'
      };
      res.locals.message = 'Chat statistics retrieved successfully';
      
    } catch (error) {
      console.error('❌ Error getting chat statistics:', error);
      res.locals.error = {
        message: 'Failed to retrieve chat statistics',
        details: error.message
      };
      res.status(500);
    }
  }
}

module.exports = ChatAppController;
