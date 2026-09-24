jest.mock('../models/GlocalCheckin', () => ({
  findByIdentifier: jest.fn(), upsert: jest.fn(), findAll: jest.fn(), count: jest.fn(),
  findById: jest.fn(), insert: jest.fn(), updateById: jest.fn(), deleteById: jest.fn()
}));
jest.mock('../adapters/surveyMonkeyClient', () => ({
  findResponseByEmail: jest.fn(), getResponse: jest.fn()
}));
jest.mock('../config/env', () => ({
  pagination: { defaultPageSize: 50, maxPageSize: 100 },
  surveyMonkey: {
    surveyId: 'survey-1', redirectUrl: 'https://survey.example/form', syncTtlMs: 60000
  }
}));

const Checkin = require('../models/GlocalCheckin');
const surveyMonkeyClient = require('../adapters/surveyMonkeyClient');
const Service = require('./GlocalCheckinService');

beforeEach(() => jest.clearAllMocks());

test('fresh completed check-in returns without a provider call', async () => {
  Checkin.findByIdentifier.mockResolvedValue({ status: 'completed', identifierValue: 'a@example.com' });
  const result = await Service.verifyCheckin({ email: ' A@Example.com ' });
  expect(result).toEqual({ completed: true });
  expect(Checkin.findByIdentifier).toHaveBeenCalledWith({
    surveyId: 'survey-1', identifierValue: 'a@example.com'
  });
  expect(surveyMonkeyClient.findResponseByEmail).not.toHaveBeenCalled();
});

test('stale check-in refreshes through the adapter and persists the result', async () => {
  Checkin.findByIdentifier.mockResolvedValue({
    status: 'partial', identifierValue: 'a@example.com', lastSyncedAt: new Date(0)
  });
  surveyMonkeyClient.findResponseByEmail.mockResolvedValue({ status: 'completed', responseId: 'r-1' });
  Checkin.upsert.mockResolvedValue({ status: 'completed', identifierValue: 'a@example.com' });
  const result = await Service.verifyCheckin({ email: 'A@Example.com' });
  expect(result).toEqual({ completed: true });
  expect(Checkin.upsert).toHaveBeenCalledWith(expect.objectContaining({
    surveyId: 'survey-1', identifierValue: 'a@example.com',
    status: 'completed', surveyMonkeyResponseId: 'r-1'
  }));
});

test('provider failure uses cached check-in', async () => {
  Checkin.findByIdentifier.mockResolvedValue({
    status: 'partial', identifierValue: 'a@example.com', lastSyncedAt: new Date(0)
  });
  surveyMonkeyClient.findResponseByEmail.mockRejectedValue(new Error('unavailable'));
  const result = await Service.verifyCheckin({ email: 'a@example.com' });
  expect(result).toEqual({
    completed: false, redirectUrl: 'https://survey.example/form?email=a%40example.com'
  });
  expect(Checkin.upsert).not.toHaveBeenCalled();
});

test('webhook writes normalized completed response', async () => {
  surveyMonkeyClient.getResponse.mockResolvedValue({ email: 'A@Example.com' });
  await Service.receiveWebhook({ surveyId: 'survey-1', responseId: 'r-1' });
  expect(Checkin.upsert).toHaveBeenCalledWith(expect.objectContaining({
    surveyId: 'survey-1', identifierValue: 'a@example.com', status: 'completed'
  }));
});
