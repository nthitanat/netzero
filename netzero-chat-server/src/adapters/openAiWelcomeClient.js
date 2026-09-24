const { fileSearchTool, Agent, Runner, withTrace } = require('@openai/agents');
const config = require('../config/env');

async function generateWelcomeResponse({ userId, chatId, inputText }) {
  if (!config.openai.apiKey || !config.welcomeChat.vectorStoreId) {
    throw new Error('Welcome AI provider is not configured');
  }
  process.env.OPENAI_API_KEY = config.openai.apiKey;
  const agent = new Agent({
    name: 'Welcome Chat Agent',
    instructions: 'Answer the user using the available knowledge tools. Be concise and summarize the answer first.',
    model: config.welcomeChat.model,
    tools: [fileSearchTool([config.welcomeChat.vectorStoreId])],
    modelSettings: {
      temperature: 1,
      topP: 1,
      maxTokens: config.welcomeChat.maxTokens,
      store: true
    }
  });
  return withTrace('Welcome Chat Workflow', async () => {
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: 'netzero-chat-server',
        workflow_id: 'welcome_chat_workflow'
      }
    });
    const result = await runner.run(agent, [{
      role: 'user',
      content: [{ type: 'input_text', text: inputText }]
    }], { context: { stateUserId: userId, stateChatId: chatId } });
    if (!result.finalOutput) throw new Error('Welcome AI provider returned no response');
    return String(result.finalOutput);
  });
}

module.exports = { generateWelcomeResponse };
