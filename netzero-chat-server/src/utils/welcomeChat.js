const { fileSearchTool, RunContext, Agent, Runner, withTrace } = require("@openai/agents");
const config = require('../config/env');

// Set OpenAI API key from config
if (config.openai.apiKey) {
  process.env.OPENAI_API_KEY = config.openai.apiKey;
}

/**
 * Welcome Chat GPT Agent Utility
 * Generates personalized welcome messages for chat sessions with file search capabilities
 */

// Tool definitions - File search with vector store
const fileSearch = fileSearchTool([
  "vs_69218fa17ad08191bbb45b2f88c8bbb0"
]);

/**
 * Agent instructions generator
 * @param {RunContext} runContext - The run context with state
 * @param {Agent} _agent - The agent instance
 * @returns {string} Instructions for the agent
 */
const myAgentInstructions = (runContext, _agent) => {
  const { stateUserId, stateChatId } = runContext.context;
  return `Answer the user's question using the knowledge tools you have on hand (file search). Be concise and answer succinctly, using bullet points and summarizing the answer up front`;
};

// Initialize the GPT agent with file search tool
const myAgent = new Agent({
  name: "Welcome Chat Agent",
  instructions: myAgentInstructions,
  model: "gpt-4.1",
  tools: [
    fileSearch
  ],
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

/**
 * Generate welcome message using GPT agent with file search
 * @param {string} userId - The user ID
 * @param {string} chatId - The chat ID
 * @param {string} inputText - The input text/question from user
 * @returns {Promise<Object>} The welcome message and output
 */
const generateWelcomeMessage = async (userId, chatId, inputText) => {
  return await withTrace("Welcome Chat Workflow", async () => {
    const state = {
      user_id: userId,
      chat_id: chatId
    };

    const conversationHistory = [
      { 
        role: "user", 
        content: [{ 
          type: "input_text", 
          text: inputText
        }] 
      }
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "netzero-chat-server",
        workflow_id: "welcome_chat_workflow"
      }
    });

    const myAgentResultTemp = await runner.run(
      myAgent,
      [
        ...conversationHistory
      ],
      {
        context: {
          stateUserId: state.user_id,
          stateChatId: state.chat_id
        }
      }
    );

    conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

    if (!myAgentResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    const myAgentResult = {
      output_text: myAgentResultTemp.finalOutput ?? ""
    };

    return myAgentResult;
  });
};

/**
 * Main export function for ChatController
 * Generates welcome message for a chat session with file search capabilities
 * @param {string} userId - The user ID
 * @param {string} chatId - The chat ID
 * @param {string} inputText - The input text/question (optional, defaults to generic welcome)
 * @returns {Promise<string>} The generated welcome message
 */
const welcomeChat = async (userId, chatId, inputText = null) => {
  try {
    // Use provided input or generate default welcome message request
    const input = inputText || `Generate a welcome message for user ${userId} in chat ${chatId}`;
    
    console.log(`🤖 Generating AI welcome message for User: ${userId}, Chat: ${chatId}`);
    
    const result = await generateWelcomeMessage(userId, chatId, input);
    
    console.log(`✅ AI welcome message generated successfully`);
    return result.output_text;
    
  } catch (error) {
    console.error('❌ Error generating AI welcome message:', error);
    // Fallback to simple welcome message if AI fails
    return `Welcome to ${chatId}! How can I help you today?`;
  }
};

module.exports = { welcomeChat };
