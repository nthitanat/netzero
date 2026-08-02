// Thin server-only client for the SurveyMonkey API, used by the Glocal
// check-in feature. The access token never leaves this backend.
const config = require('./env');

const SURVEYMONKEY_BASE_URL = 'https://api.surveymonkey.com/v3';
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const EMAIL_FIELD_PATTERNS = [
  'email',
  'e-mail',
  'อีเมล',
  'อีเมล์'
];
const EMAIL_SCAN_PER_PAGE = 100;
const EMAIL_SCAN_MAX_PAGES = 10;

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

function normalizeEmail(value) {
  if (!value) return null;

  const match = String(value).match(EMAIL_REGEX);
  return match ? match[0].trim().toLowerCase() : null;
}

function getCustomVariableEmail(response) {
  const customVariables = response?.custom_variables || {};

  if (customVariables.email) {
    return normalizeEmail(customVariables.email);
  }

  const emailLikeKey = Object.keys(customVariables).find(key =>
    EMAIL_FIELD_PATTERNS.some(pattern => key.toLowerCase().includes(pattern))
  );

  return emailLikeKey ? normalizeEmail(customVariables[emailLikeKey]) : null;
}

function collectStrings(value, result = []) {
  if (value === null || value === undefined) {
    return result;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    result.push(String(value));
    return result;
  }

  if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, result));
    return result;
  }

  if (typeof value === 'object') {
    Object.values(value).forEach(item => collectStrings(item, result));
  }

  return result;
}

function questionLooksLikeEmailField(question) {
  const labelValues = [
    question?.heading,
    question?.headings,
    question?.question_text,
    question?.text,
    question?.title,
    question?.name
  ];
  const label = collectStrings(labelValues).join(' ').toLowerCase();

  return EMAIL_FIELD_PATTERNS.some(pattern => label.includes(pattern));
}

function getAnswerEmail(question) {
  const answers = Array.isArray(question?.answers) ? question.answers : [];

  for (const answer of answers) {
    const email = normalizeEmail([
      answer?.text,
      answer?.simple_text,
      answer?.other_text,
      answer?.value
    ].filter(Boolean).join(' '));

    if (email) return email;
  }

  return null;
}

function getSurveyAnswerEmail(response) {
  const pages = Array.isArray(response?.pages) ? response.pages : [];
  const questions = pages.flatMap(page => Array.isArray(page?.questions) ? page.questions : []);

  for (const question of questions) {
    if (!questionLooksLikeEmailField(question)) continue;

    const email = getAnswerEmail(question);
    if (email) return email;
  }

  for (const question of questions) {
    const email = getAnswerEmail(question);
    if (email) return email;
  }

  return null;
}

function getResponseEmail(response) {
  return getCustomVariableEmail(response) || getSurveyAnswerEmail(response);
}

function responseMatchesEmail(response, normalizedEmail) {
  return getResponseEmail(response) === normalizedEmail;
}

// Look up a survey response by the 'email' custom variable. SurveyMonkey may
// still return a broad response list when no custom-variable match exists, so
// verify the response email locally before accepting it.
async function findResponseByEmail(surveyId, normalizedEmail) {
  const customVariableFilter = `'email'='${normalizedEmail}'`;
  const query = new URLSearchParams({
    custom_variables: customVariableFilter,
    per_page: '100'
  }).toString();
  const data = await request(`/surveys/${surveyId}/responses/bulk?${query}`);

  const responses = Array.isArray(data?.data) ? data.data : [];
  let match = responses.find(response => responseMatchesEmail(response, normalizedEmail));

  if (!match) {
    match = await findResponseByAnswerEmail(surveyId, normalizedEmail);
  }

  return match
    ? { status: mapResponseStatus(match.response_status), responseId: match.id }
    : { status: 'not_started', responseId: null };
}

async function findResponseByAnswerEmail(surveyId, normalizedEmail) {
  for (let page = 1; page <= EMAIL_SCAN_MAX_PAGES; page += 1) {
    const query = new URLSearchParams({
      simple: 'true',
      per_page: String(EMAIL_SCAN_PER_PAGE),
      page: String(page)
    }).toString();
    const data = await request(`/surveys/${surveyId}/responses/bulk?${query}`);
    const responses = Array.isArray(data?.data) ? data.data : [];
    const match = responses.find(response => responseMatchesEmail(response, normalizedEmail));

    if (match) return match;
    if (!responses.length || !data?.links?.next) return null;
  }

  return null;
}

// Fetch a single response, including the custom variables (used by the
// webhook handler, since the webhook payload itself only has resource IDs).
async function getResponse(surveyId, responseId) {
  const data = await request(`/surveys/${surveyId}/responses/${responseId}`);

  return {
    responseId: data.id,
    status: mapResponseStatus(data.response_status),
    email: getResponseEmail(data)
  };
}

module.exports = {
  findResponseByEmail,
  getResponse,
  SurveyMonkeyRateLimitError,
  _private: {
    getResponseEmail,
    getSurveyAnswerEmail,
    normalizeEmail,
    responseMatchesEmail
  }
};
