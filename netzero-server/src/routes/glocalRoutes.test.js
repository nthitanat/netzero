jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 1, role: 'admin' };
    next();
  },
  authorizeRoles: () => (req, res, next) => next(),
  authenticateSurveyMonkeyWebhook: (req, res, next) => next()
}));
jest.mock('../services/GlocalCheckinService', () => ({
  verifyCheckin: jest.fn(), listCheckins: jest.fn(), receiveWebhook: jest.fn(),
  updateCheckin: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const Service = require('../services/GlocalCheckinService');
const glocalRoutes = require('./glocalRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/glocal', glocalRoutes);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('verification keeps the public response shape', async () => {
  Service.verifyCheckin.mockResolvedValue({ completed: true });
  const response = await request(app)
    .post('/api/v1/glocal/survey-checkins/verify')
    .send({ email: 'A@Example.com' });
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    success: true, message: 'Check-in verified', data: { completed: true }
  });
  expect(Service.verifyCheckin).toHaveBeenCalledWith({ email: 'A@Example.com' });
});

test('invalid email is rejected before service execution', async () => {
  const response = await request(app)
    .post('/api/v1/glocal/survey-checkins/verify')
    .send({ email: 'invalid' });
  expect(response.status).toBe(400);
  expect(Service.verifyCheckin).not.toHaveBeenCalled();
});

test('legacy response ID spelling maps to internal camelCase', async () => {
  Service.updateCheckin.mockResolvedValue({ checkinId: 2, surveyMonkeyResponseId: 'response-1' });
  const response = await request(app)
    .patch('/api/v1/glocal/survey-checkins/2')
    .send({ surveymonkeyResponseId: 'response-1' });
  expect(response.status).toBe(200);
  expect(Service.updateCheckin).toHaveBeenCalledWith({
    checkinId: 2,
    updates: { surveyMonkeyResponseId: 'response-1' }
  });
  expect(response.body.data.surveymonkey_response_id).toBe('response-1');
});
