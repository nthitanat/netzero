// Thin server-only client for the SurveyMonkey API, used by the Glocal
// check-in feature. The access token never leaves this backend.
const config = require('./env');

const SURVEYMONKEY_BASE_URL = 'https://api.surveymonkey.com/v3';

class SurveyMonkeyRateLimitError extends Error {
  constructor(message = 'SurveyMonkey rate limit exceeded') {
    super(message);
    this.name = 'SurveyMonkeyRateLimitError';
    this.statusCode = 429;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${SURVEYMONKEY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.surveyMonkey.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (response.status === 429) {
    throw new SurveyMonkeyRateLimitError();
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`SurveyMonkey API error (${response.status}): ${body.slice(0, 200)}`);
  }

  return response.json();
}

// Map SurveyMonkey's response_status to our local status enum
function mapResponseStatus(responseStatus) {
  if (responseStatus === 'completed') return 'completed';
  if (responseStatus) return 'partial';
  return 'not_started';
}

// Look up a survey response by the 'email' custom variable. SurveyMonkey may
// still return a broad response list when no custom-variable match exists, so
// verify the response's custom_variables.email locally before accepting it.
async function findResponseByEmail(surveyId, normalizedEmail) {
  const customVariableFilter = `'email'='${normalizedEmail}'`;
  const query = new URLSearchParams({
    custom_variables: customVariableFilter,
    per_page: '100'
  }).toString();
  const data = await request(`/surveys/${surveyId}/responses/bulk?${query}`);

  const responses = Array.isArray(data?.data) ? data.data : [];
  const match = responses.find(response => {
    const email = response?.custom_variables?.email;
    return email && String(email).trim().toLowerCase() === normalizedEmail;
  });

  if (!match) {
    return { status: 'not_started', responseId: null };
  }

  return { status: mapResponseStatus(match.response_status), responseId: match.id };
}

// Fetch a single response, including the custom variables (used by the
// webhook handler, since the webhook payload itself only has resource IDs).
async function getResponse(surveyId, responseId) {
  const data = await request(`/surveys/${surveyId}/responses/${responseId}`);
  const customVariables = data.custom_variables || {};

  return {
    responseId: data.id,
    status: mapResponseStatus(data.response_status),
    email: customVariables.email ? String(customVariables.email).trim().toLowerCase() : null
  };
}

module.exports = {
  findResponseByEmail,
  getResponse,
  SurveyMonkeyRateLimitError
};
