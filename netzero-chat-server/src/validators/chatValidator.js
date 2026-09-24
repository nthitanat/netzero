const config = require('../config/env');

const MAX_MESSAGE_LENGTH = config.welcomeChat.maxMessageLength;
const MAX_CHAT_ID_LENGTH = config.welcomeChat.maxChatIdLength;

function validateChatId(req, res, next) {
  const chatId = req.params.chatid;
  if (!chatId || chatId.length > MAX_CHAT_ID_LENGTH) {
    return res.status(400).json({ success: false, message: 'Invalid chat ID', timestamp: new Date().toISOString() });
  }
  req.validated = { ...(req.validated || {}), params: { chatId } };
  next();
}

function validateMessage(req, res, next) {
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`,
      timestamp: new Date().toISOString()
    });
  }
  req.validated = { ...(req.validated || {}), body: { message } };
  next();
}

module.exports = { validateChatId, validateMessage };
