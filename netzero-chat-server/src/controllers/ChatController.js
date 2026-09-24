const ChatService = require('../services/ChatService');
const { sendSuccess } = require('../middleware/response');

async function getChatWelcome(req, res) {
  const { chatId, userId, welcomeMessage } = await ChatService.getWelcome({
    actor: req.user,
    chatId: req.validated.params.chatId
  });
  return sendSuccess(res, {
    message: 'Welcome message generated successfully',
    data: { chatId, userId, message: welcomeMessage }
  });
}

async function sendMessage(req, res) {
  const userMessage = req.validated.body.message;
  const { chatId, userId, welcomeMessage } = await ChatService.getWelcome({
    actor: req.user,
    chatId: req.validated.params.chatId,
    message: userMessage
  });
  return sendSuccess(res, {
    message: 'Message received and welcome response sent',
    data: { chatId, userId, userMessage, botResponse: welcomeMessage }
  });
}

function getHealthCheck(req, res) {
  return sendSuccess(res, {
    message: 'Chat service is healthy',
    data: ChatService.getHealth()
  });
}

module.exports = { getChatWelcome, sendMessage, getHealthCheck };
