const { executeQuery } = require('../config/database');

class ChatController {
  
  // GET /api/v1/chat/:chatid - Get chat welcome message
  static async getChatWelcome(req, res) {
    try {
      const { chatid } = req.params;
      const userId = req.user ? req.user.userId : 'anonymous';

      console.log(`💬 Chat request - User: ${userId}, Chat ID: ${chatid}`);

      // Simple welcome message
      const welcomeMessage = `Welcome to ${chatid}! How can I help you today?`;

      res.locals.data = {
        chatId: chatid,
        userId: userId,
        message: welcomeMessage
      };

      res.locals.message = 'Welcome message generated successfully';
      res.json();
      
    } catch (error) {
      console.error('❌ Error in chat welcome:', error);
      res.locals.error = {
        message: 'Failed to generate welcome message',
        details: error.message
      };
      res.status(500);
      res.json();
    }
  }

  // POST /api/v1/chat/:chatid/message - Send message and get welcome response
  static async sendMessage(req, res) {
    try {
      const { chatid } = req.params;
      const { message } = req.body;
      const userId = req.user ? req.user.userId : 'anonymous';

      console.log(`💬 Message from User ${userId} in Chat ${chatid}: ${message}`);

      // Simple response with the same welcome message
      const welcomeMessage = `Welcome to ${chatid}! How can I help you today?`;

      res.locals.data = {
        chatId: chatid,
        userId: userId,
        userMessage: message,
        botResponse: welcomeMessage
      };

      res.locals.message = 'Message received and welcome response sent';
      res.json();
      
    } catch (error) {
      console.error('❌ Error sending chat message:', error);
      res.locals.error = {
        message: 'Failed to send message',
        details: error.message
      };
      res.status(500);
      res.json();
    }
  }

  // GET /api/v1/chat/health - Health check for chat service
  static async getHealthCheck(req, res) {
    try {
      res.locals.data = {
        service: 'netzero-chat-server',
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      res.locals.message = 'Chat service is healthy';
      res.json();
      
    } catch (error) {
      console.error('❌ Error in health check:', error);
      res.locals.error = {
        message: 'Health check failed',
        details: error.message
      };
      res.status(500);
      res.json();
    }
  }
}

module.exports = ChatController;