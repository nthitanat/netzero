const OpenAI = require('openai');
const config = require('../config/env');

function parseJsonOutput(outputText) {
  try {
    return JSON.parse(outputText);
  } catch {
    const withoutFences = outputText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const match = withoutFences.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI response did not contain JSON');
    return JSON.parse(match[0]);
  }
}

async function evaluateSurvey({ searchInstruction, outputInstruction, prompt }) {
  if (!config.openai.apiKey) throw new Error('OpenAI API key is not configured');
  const client = new OpenAI({ apiKey: config.openai.apiKey });
  const input = `${searchInstruction}

${outputInstruction}

CRITICAL: Respond with valid JSON only.

User Query:
${prompt}`;
  const response = await client.responses.create({
    model: config.productSurvey.model,
    tools: [{ type: 'web_search' }],
    tool_choice: 'auto',
    input,
    include: ['web_search_call.action.sources'],
    max_output_tokens: config.productSurvey.maxOutputTokens
  });
  if (!response.output_text) throw new Error('AI response was empty');
  return {
    result: parseJsonOutput(response.output_text),
    rawText: response.output_text,
    usage: response.usage
  };
}

module.exports = { evaluateSurvey };
