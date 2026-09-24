const Checkin = require('../models/GlocalCheckin');
const surveyMonkeyClient = require('../adapters/surveyMonkeyClient');
const config = require('../config/env');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const IDENTIFIER_TYPE = 'email';
const STATUS = Object.freeze({
  NOT_STARTED: 'not_started',
  COMPLETED: 'completed'
});

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function requireSurveyConfig() {
  const { surveyId, redirectUrl } = config.surveyMonkey;
  if (!surveyId || !redirectUrl) {
    throw applicationError('EXTERNAL', 'Check-in verification is temporarily unavailable');
  }
  return { surveyId, redirectUrl };
}

function buildVerifyResult(checkin, redirectUrl) {
  if (checkin.status === STATUS.COMPLETED) return { completed: true };
  return {
    completed: false,
    redirectUrl: `${redirectUrl}?email=${encodeURIComponent(checkin.identifierValue)}`
  };
}

async function verifyCheckin({ email }) {
  const normalizedEmail = normalizeEmail(email);
  const { surveyId, redirectUrl } = requireSurveyConfig();
  let checkin = await Checkin.findByIdentifier({
    surveyId,
    identifierValue: normalizedEmail
  });
  const isFresh = Boolean(checkin && checkin.status === STATUS.COMPLETED) || Boolean(
    checkin && checkin.lastSyncedAt &&
    Date.now() - new Date(checkin.lastSyncedAt).getTime() < config.surveyMonkey.syncTtlMs
  );
  if (!isFresh) {
    let surveyResponse = null;
    try {
      surveyResponse = await surveyMonkeyClient.findResponseByEmail(surveyId, normalizedEmail);
    } catch (error) {
      console.error('SurveyMonkey lookup failed:', error);
    }
    if (surveyResponse) {
      checkin = await Checkin.upsert({
        surveyId,
        identifierType: IDENTIFIER_TYPE,
        identifierValue: normalizedEmail,
        status: surveyResponse.status,
        surveyMonkeyResponseId: surveyResponse.responseId,
        completedAt: surveyResponse.status === STATUS.COMPLETED
          ? new Date() : (checkin ? checkin.completedAt : null),
        lastSyncedAt: new Date()
      });
    } else if (!checkin) {
      checkin = await Checkin.upsert({
        surveyId,
        identifierType: IDENTIFIER_TYPE,
        identifierValue: normalizedEmail,
        status: STATUS.NOT_STARTED
      });
    }
  }
  return buildVerifyResult(checkin, redirectUrl);
}

async function listCheckins({ filters = {} }) {
  const boundedFilters = {
    ...filters,
    limit: Math.min(filters.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: filters.offset ?? 0
  };
  const [items, total] = await Promise.all([
    Checkin.findAll(boundedFilters),
    Checkin.count(boundedFilters)
  ]);
  return { items, total };
}

async function getCheckinById({ checkinId }) {
  const checkin = await Checkin.findById(checkinId);
  if (!checkin) throw applicationError('NOT_FOUND', 'Check-in not found');
  return checkin;
}

async function createCheckin({ data }) {
  const checkinId = await Checkin.insert({
    surveyId: data.surveyId,
    identifierType: IDENTIFIER_TYPE,
    identifierValue: normalizeEmail(data.identifierValue),
    status: data.status ?? STATUS.NOT_STARTED
  });
  return Checkin.findById(checkinId);
}

async function updateCheckin({ checkinId, updates }) {
  const modelUpdates = { ...updates };
  if (updates.status === STATUS.COMPLETED) modelUpdates.completedAt = new Date();
  const didUpdate = await Checkin.updateById(checkinId, modelUpdates);
  if (!didUpdate) throw applicationError('NOT_FOUND', 'Check-in not found');
  return Checkin.findById(checkinId);
}

async function deleteCheckin({ checkinId }) {
  const didDelete = await Checkin.deleteById(checkinId);
  if (!didDelete) throw applicationError('NOT_FOUND', 'Check-in not found');
}

async function receiveWebhook({ surveyId, responseId }) {
  const response = await surveyMonkeyClient.getResponse(surveyId, responseId);
  if (!response.email) return { processed: false };
  await Checkin.upsert({
    surveyId,
    identifierType: IDENTIFIER_TYPE,
    identifierValue: normalizeEmail(response.email),
    status: STATUS.COMPLETED,
    surveyMonkeyResponseId: responseId,
    completedAt: new Date(),
    lastSyncedAt: new Date()
  });
  return { processed: true };
}

module.exports = {
  verifyCheckin,
  listCheckins,
  getCheckinById,
  createCheckin,
  updateCheckin,
  deleteCheckin,
  receiveWebhook
};
