const { version } = require('../../package.json');

const ANONYMOUS_USER_ID = 'anonymous';

function createChatService({ welcomeClient, getUptime = process.uptime } = {}) {
  const provider = welcomeClient || require('../adapters/openAiWelcomeClient');

  async function getWelcome({ actor, chatId, message }) {
    const userId = actor ? (actor.userId ?? actor.id) : ANONYMOUS_USER_ID;
    const inputText = message || `Generate a welcome message for user ${userId} in chat ${chatId}`;
    try {
      const welcomeMessage = await provider.generateWelcomeResponse({
        userId, chatId, inputText
      });
      return { chatId, userId, welcomeMessage };
    } catch (error) {
      console.error('Welcome AI provider failed:', error);
      return { chatId, userId, welcomeMessage: `Welcome to ${chatId}! How can I help you today?` };
    }
  }

  function getHealth() {
    return {
      service: 'netzero-chat-server',
      status: 'healthy',
      version,
      uptime: getUptime(),
      timestamp: new Date().toISOString()
    };
  }

  return { getWelcome, getHealth };
}

module.exports = { ...createChatService(), createChatService };
