const openAiApiUtil = require('./openAiApiUtil');

/**
 * Simple AI Web Search Utility
 * Built on top of openAiApiUtil
 * Uses OpenAI's Responses API with web_search tool for real-time information retrieval
 * 
 * @typedef {Object} SimpleAiWebsearchInput
 * @property {string} searchInstruction - Instructions on how to think/search
 * @property {string} outputInstruction - Strict JSON schema for output
 * @property {string} prompt - Main content to analyze (product + survey data)
 * @property {Object} options - Additional options for OpenAI API
 * @property {boolean} options.enableWebSearch - Enable OpenAI web search tool (default: true)
 * 
 * @typedef {Object} SimpleAiWebsearchResult
 * @property {any} result - Parsed JSON according to outputInstruction
 * @property {string} rawText - Original model output string
 * @property {Array} citations - URL citations from web search (with annotations)
 * @property {Array} sources - All URLs consulted during web search
 * @property {Object} usage - Token usage information
 */

class SimpleAiWebsearch {
  /**
   * Execute AI-powered search and analysis with web search tool
   * Uses OpenAI's Responses API with web_search tool for real-time information retrieval
   * @param {SimpleAiWebsearchInput} input - Search input parameters
   * @returns {Promise<SimpleAiWebsearchResult>} Search result with parsed JSON
   */
  async search(input) {
    const { 
      searchInstruction, 
      outputInstruction, 
      prompt,
      options = {}
    } = input;

    // Validate required parameters
    if (!searchInstruction) {
      throw new Error('searchInstruction is required');
    }
    if (!outputInstruction) {
      throw new Error('outputInstruction is required');
    }
    if (!prompt) {
      throw new Error('prompt is required');
    }

    const enableWebSearch = options.enableWebSearch !== false; // Default true

    console.log('🔍 SimpleAiWebsearch - Starting AI search...');
    console.log(`   Web Search: ${enableWebSearch ? 'Enabled (Responses API)' : 'Disabled'}`);
    console.log(`   Search Instruction: ${searchInstruction.substring(0, 100)}...`);
    console.log(`   Prompt length: ${prompt.length} characters`);

    try {
      if (enableWebSearch) {
        // Use Responses API with web_search tool (CORRECT SYNTAX)
        console.log('🌐 Using OpenAI Responses API with web_search tool...');
        
        // Compose full input with instructions and prompt
        const fullInput = `${searchInstruction}

You have access to web search capabilities. Use them to find current, accurate information about:
- SDG (Sustainable Development Goals) standards
- SBTi (Science Based Targets initiative) guidelines
- ISO net-zero standards and certifications
- Current sustainability best practices
- Green energy and environmental regulations

${outputInstruction}

CRITICAL: Respond with valid JSON only.

User Query:
${prompt}`;

        // Define web search tool (Responses API syntax)
        const tools = [
          {
            type: 'web_search'
          }
        ];

        // Call Responses API
        const response = await openAiApiUtil.callWithWebSearch(fullInput, tools, {
          model: options.model || 'gpt-4o',
          tool_choice: 'auto',
          temperature: options.temperature || 0.3,
          maxTokens: options.maxTokens || 3000,
          include: ['web_search_call.action.sources'] // Include sources
        });

        console.log('✅ SimpleAiWebsearch - Responses API completed');
        console.log(`   Output length: ${response.output_text?.length || 0} characters`);

        // Parse JSON from output_text
        let result;
        try {
          result = JSON.parse(response.output_text);
        } catch (e) {
          // Fallback: try to extract JSON
          console.warn('⚠️  Direct JSON parse failed, attempting extraction...');
          result = this._parseJson(response.output_text);
        }

        // Extract citations and sources
        const citations = [];
        const sources = [];
        
        if (response.output && Array.isArray(response.output)) {
          for (const item of response.output) {
            // Extract web search sources
            if (item.type === 'web_search_call' && item.action?.sources) {
              sources.push(...item.action.sources);
            }
            // Extract inline citations
            if (item.type === 'message' && item.content) {
              for (const content of item.content) {
                if (content.annotations) {
                  citations.push(...content.annotations.filter(a => a.type === 'url_citation'));
                }
              }
            }
          }
        }

        console.log(`   Citations: ${citations.length}, Sources: ${sources.length}`);

        return {
          result,
          rawText: response.output_text,
          citations,
          sources,
          usage: response.usage
        };

      } else {
        // Fallback: Use structured JSON output without web search
        console.log('📝 Using structured output without web search...');
        
        const systemPrompt = `${searchInstruction}

${outputInstruction}

CRITICAL: You MUST respond ONLY with valid JSON. No markdown, no code blocks.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ];

        const result = await openAiApiUtil.callForJson(messages, {
          temperature: options.temperature || 0.3,
          maxTokens: options.maxTokens || 2000,
          model: options.model || 'gpt-4o-mini'
        });

        console.log('✅ SimpleAiWebsearch - Structured response received');

        return {
          result,
          rawText: JSON.stringify(result)
        };
      }

    } catch (error) {
      console.error('❌ SimpleAiWebsearch - Error:', error.message);
      throw new Error(`SimpleAiWebsearch failed: ${error.message}`);
    }
  }

  /**
   * Execute search with tools (for future extension with web search tools)
   * @param {SimpleAiWebsearchInput} input - Search input
   * @param {Array} tools - OpenAI tools definition array
   * @returns {Promise<SimpleAiWebsearchResult>} Search result
   */
  async searchWithTools(input, tools = []) {
    const { 
      searchInstruction, 
      outputInstruction, 
      prompt,
      options = {}
    } = input;

    console.log('🔧 SimpleAiWebsearch - Search with tools');
    console.log(`   Tools: ${tools.length} tool(s) available`);

    try {
      const systemPrompt = `${searchInstruction}

${outputInstruction}`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // Call OpenAI with tools
      const response = await openAiApiUtil.callWithTools(messages, tools, {
        temperature: options.temperature || 0.3,
        maxTokens: options.maxTokens || 2000,
        model: options.model || 'gpt-4o-mini'
      });

      console.log('✅ SimpleAiWebsearch - Tools response received');

      // If there are tool calls, handle them (for future implementation)
      if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`   Tool calls: ${response.tool_calls.length}`);
        // Future: Execute tools and continue conversation
      }

      // Parse content as JSON if available
      let result = {};
      if (response.content) {
        try {
          result = JSON.parse(response.content);
        } catch (e) {
          // If not JSON, use response_format method instead
          console.warn('⚠️  Response not JSON, falling back to standard search');
          return await this.search(input);
        }
      }

      return {
        result,
        rawText: response.content || '',
        tool_calls: response.tool_calls
      };

    } catch (error) {
      console.error('❌ SimpleAiWebsearch with tools - Error:', error.message);
      throw new Error(`SimpleAiWebsearch with tools failed: ${error.message}`);
    }
  }

  /**
   * Parse JSON from AI response (fallback for legacy compatibility)
   * @param {string} text - Raw text response
   * @returns {Object} Parsed JSON object
   * @private
   */
  _parseJson(text) {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch (e) {
      // If direct parse fails, try to extract JSON from text
      console.log('⚠️  Direct JSON parse failed, attempting extraction...');
      
      // Remove markdown code blocks if present
      let cleaned = text.trim();
      
      // Remove ```json ... ``` blocks
      cleaned = cleaned.replace(/```json\s*/gi, '');
      cleaned = cleaned.replace(/```\s*/g, '');
      
      // Extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ Failed to parse extracted JSON:', parseError.message);
        console.error('Full extracted text length:', jsonMatch[0].length);
        console.error('First 500 chars:', jsonMatch[0].substring(0, 500));
        console.error('Last 200 chars:', jsonMatch[0].substring(jsonMatch[0].length - 200));
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
      }
    }
  }

  /**
   * Execute search with typed result
   * Generic method for type-safe results
   * @template T
   * @param {SimpleAiWebsearchInput} input - Search input
   * @returns {Promise<SimpleAiWebsearchResult<T>>} Typed search result
   */
  async searchTyped(input) {
    return await this.search(input);
  }

  /**
   * Execute batch searches in parallel
   * @param {Array<SimpleAiWebsearchInput>} inputs - Array of search inputs
   * @returns {Promise<Array<SimpleAiWebsearchResult>>} Array of results
   */
  async batchSearch(inputs) {
    console.log(`🔍 SimpleAiWebsearch - Batch search: ${inputs.length} queries`);
    
    const results = await Promise.all(
      inputs.map(input => this.search(input))
    );
    
    console.log(`✅ SimpleAiWebsearch - Batch complete: ${results.length} results`);
    
    return results;
  }

  /**
   * Execute search with retry on specific errors
   * @param {SimpleAiWebsearchInput} input - Search input
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<SimpleAiWebsearchResult>} Search result
   */
  async searchWithRetry(input, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 SimpleAiWebsearch - Retry attempt ${attempt}/${maxRetries}`);
        return await this.search(input);
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Waiting ${backoffMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
    
    throw new Error(`SimpleAiWebsearch failed after ${maxRetries} attempts: ${lastError.message}`);
  }
}

// Export singleton instance
module.exports = new SimpleAiWebsearch();
