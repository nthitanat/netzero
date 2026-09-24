jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => { req.user = { userId: 7, role: 'user' }; next(); },
  optionalAuth: (req, res, next) => next()
}));
jest.mock('../services/SurveyService', () => ({
  listSurveys: jest.fn(), submitSurvey: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const Service = require('../services/SurveyService');
const router = require('./surveyRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/surveys', router);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('survey list sends parsed filters to service', async () => {
  Service.listSurveys.mockResolvedValue([]);
  const response = await request(app).get('/api/v1/surveys?active=true&limit=10');
  expect(response.status).toBe(200);
  expect(Service.listSurveys).toHaveBeenCalledWith({ filters: { active: true, limit: 10 } });
});

test('survey submission maps legacy fields at controller boundary', async () => {
  Service.submitSurvey.mockResolvedValue({ responseId: 11, answers: [] });
  const response = await request(app).post('/api/v1/surveys/4/submit').send({
    respondent_id: 'anon', answers: [{ question_id: 8, answer_text: 'Yes' }]
  });
  expect(response.status).toBe(201);
  expect(Service.submitSurvey).toHaveBeenCalledWith({
    surveyId: 4,
    actor: undefined,
    data: { respondentId: 'anon', answers: [{
      questionId: 8, answerText: 'Yes', answerChoiceId: undefined
    }] }
  });
  expect(response.body.data.response_id).toBe(11);
});

test('invalid survey ID is rejected before service execution', async () => {
  const response = await request(app).post('/api/v1/surveys/invalid/submit').send({
    answers: [{ question_id: 8 }]
  });
  expect(response.status).toBe(400);
  expect(Service.submitSurvey).not.toHaveBeenCalled();
});

test('numeric respondent ID from registration is accepted as text identity', async () => {
  Service.submitSurvey.mockResolvedValue({ responseId: 12, answers: [] });
  const response = await request(app).post('/api/v1/surveys/4/submit').send({
    respondent_id: 7, answers: [{ question_id: 8, answer_text: 'Yes' }]
  });
  expect(response.status).toBe(201);
  expect(Service.submitSurvey).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ respondentId: '7' })
  }));
});
