const OpenAI = require('openai');
const config = require('../config/env');

// Set OpenAI API key in environment for @openai/agents compatibility
if (config.openai.apiKey) {
  process.env.OPENAI_API_KEY = config.openai.apiKey;
}

/**
 * OpenAI API Utility
 * Low-level wrapper around the OpenAI API with tools support
 * Handles API calls with retry logic, error handling, and structured outputs
 */
class OpenAiApiUtil {
  constructor() {
    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: config.openai.apiKey
    });

    // Default configuration
    this.defaultConfig = {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 60000, // 60 seconds
      maxRetries: 3
    };
  }

  /**
   * Call OpenAI API with messages
   * @param {Object} params - API call parameters
   * @param {string} params.model - Model to use (default: gpt-4o-mini)
   * @param {Array} params.messages - Array of message objects
   * @param {number} params.temperature - Temperature (0-2)
   * @param {number} params.maxTokens - Maximum tokens to generate
   * @param {number} params.timeout - Request timeout in milliseconds
   * @param {number} params.maxRetries - Maximum retry attempts
   * @returns {Promise<string>} Assistant's response content
   */
  async call(params) {
    const {
      model = this.defaultConfig.model,
      messages,
      temperature = this.defaultConfig.temperature,
      maxTokens = this.defaultConfig.maxTokens,
      timeout = this.defaultConfig.timeout,
      maxRetries = this.defaultConfig.maxRetries
    } = params;

    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required and must not be empty');
    }

    // Validate API key
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    let lastError;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`🤖 OpenAI API Call - Attempt ${retryCount + 1}/${maxRetries}`);
        console.log(`   Model: ${model}`);
        console.log(`   Temperature: ${temperature}`);
        console.log(`   Max Tokens: ${maxTokens}`);
        console.log(`   Messages: ${messages.length} message(s)`);

        // Create chat completion with timeout
        const completion = await Promise.race([
          this.client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI API timeout')), timeout)
          )
        ]);

        // Extract response content
        const content = completion.choices[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response from OpenAI API');
        }

        console.log(`✅ OpenAI API Success - Response length: ${content.length} characters`);
        
        return content;

      } catch (error) {
        lastError = error;
        retryCount++;

        console.error(`❌ OpenAI API Error - Attempt ${retryCount}/${maxRetries}:`, error.message);

        // Check if we should retry
        if (retryCount < maxRetries) {
          // Exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          console.log(`⏳ Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    // All retries failed
    console.error(`💥 OpenAI API Failed after ${maxRetries} attempts`);
    throw new Error(`OpenAI API call failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Call OpenAI API with a simple prompt
   * @param {string} prompt - User prompt
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Assistant's response
   */
  async simpleCall(prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    return await this.call({
      ...options,
      messages
    });
  }

  /**
   * Call OpenAI API with system and user messages
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Assistant's response
   */
  async callWithSystem(systemPrompt, userPrompt, options = {}) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    return await this.call({
      ...options,
      messages
    });
  }

  /**
   * Call OpenAI API with structured output (JSON mode)
   * Uses response_format for guaranteed JSON output
   * @param {Array} messages - Messages array
   * @param {Object} options - Additional options
   * @param {Object} options.schema - JSON schema for structured output
   * @returns {Promise<Object>} Parsed JSON response
   */
  async callForJson(messages, options = {}) {
    try {
      console.log('🤖 OpenAI API Call with Structured Output (JSON mode)');

      // Use OpenAI's response_format for structured JSON output
      const completion = await this.client.chat.completions.create({
        model: options.model || this.defaultConfig.model,
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || this.defaultConfig.maxTokens,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenAI API');
      }

      console.log('✅ OpenAI Structured Output received');

      // Parse the JSON response
      const parsed = JSON.parse(content);
      return parsed;

    } catch (error) {
      console.error('❌ Error with OpenAI structured output:', error.message);
      throw new Error(`Failed to get structured JSON response: ${error.message}`);
    }
  }

  /**
   * Call OpenAI Responses API with web search tool
   * Uses the Responses API (not Chat Completions) for web search
   * @param {string} input - User input/prompt
   * @param {Array} tools - Array of tool definitions (e.g., [{type: "web_search"}])
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response with output text and citations
   */
  async callWithWebSearch(input, tools, options = {}) {
    try {
      console.log('🌐 OpenAI Responses API Call with Web Search');
      console.log(`   Tools: ${tools.length} tool(s) available`);
      console.log(`   Input length: ${input.length} characters`);

      // Use Responses API for web search
      const response = await this.client.responses.create({
        model: options.model || 'gpt-4o',
        tools: tools,
        tool_choice: options.tool_choice || 'auto',
        input: input,
        // Optional parameters
        ...(options.reasoning && { reasoning: options.reasoning }),
        ...(options.include && { include: options.include }),
        ...(options.temperature !== undefined && { temperature: options.temperature })
      });

      if (!response) {
        throw new Error('Empty response from OpenAI Responses API');
      }

      console.log('✅ OpenAI Responses API response received');
      console.log(`   Output length: ${response.output_text?.length || 0} characters`);

      // Return structured response
      return {
        output_text: response.output_text,
        output: response.output, // Full output items array
        usage: response.usage,
        id: response.id,
        model: response.model
      };

    } catch (error) {
      console.error('❌ Error with OpenAI Responses API:', error.message);
      throw new Error(`Failed to call OpenAI Responses API: ${error.message}`);
    }
  }

  /**
   * Call OpenAI API with tools/function calling (Chat Completions API)
   * For non-web-search tools, use Chat Completions
   * @param {Array} messages - Messages array
   * @param {Array} tools - Array of tool definitions
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response with tool calls or message
   */
  async callWithTools(messages, tools, options = {}) {
    try {
      console.log('🔧 OpenAI API Call with Tools (Chat Completions)');
      console.log(`   Tools: ${tools.length} tool(s) available`);

      const completion = await this.client.chat.completions.create({
        model: options.model || this.defaultConfig.model,
        messages,
        tools,
        tool_choice: options.tool_choice || 'auto',
        temperature: options.temperature || this.defaultConfig.temperature,
        max_tokens: options.maxTokens || this.defaultConfig.maxTokens
      });

      const message = completion.choices[0]?.message;

      if (!message) {
        throw new Error('Empty response from OpenAI API');
      }

      console.log('✅ OpenAI Tools response received');

      // Return the full message which may contain tool_calls
      return {
        content: message.content,
        tool_calls: message.tool_calls || [],
        finish_reason: completion.choices[0]?.finish_reason
      };

    } catch (error) {
      console.error('❌ Error with OpenAI tools:', error.message);
      throw new Error(`Failed to call OpenAI with tools: ${error.message}`);
    }
  }

  /**
   * Get available models
   * @returns {Array<string>} List of available model names
   */
  getAvailableModels() {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }

  /**
   * Get client instance for advanced usage
   * @returns {OpenAI} OpenAI client instance
   */
  getClient() {
    return this.client;
  }
}

// Export singleton instance
module.exports = new OpenAiApiUtil();
