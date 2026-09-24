jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));
jest.mock('../models/survey/Survey', () => ({ insert: jest.fn(), findById: jest.fn() }));
jest.mock('../models/survey/Question', () => ({ insert: jest.fn(), findBySurveyId: jest.fn() }));
jest.mock('../models/survey/Response', () => ({ insert: jest.fn(), findById: jest.fn(), hasResponded: jest.fn() }));
jest.mock('../models/survey/Answer', () => ({ insertMany: jest.fn(), findByResponseId: jest.fn() }));

const { withTransaction } = require('../config/database');
const Survey = require('../models/survey/Survey');
const Question = require('../models/survey/Question');
const Response = require('../models/survey/Response');
const Answer = require('../models/survey/Answer');
const Service = require('./SurveyService');

const tx = { execute: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation(operation => operation(tx));
  Survey.findById.mockResolvedValue({ surveyId: 4, startDate: null, endDate: null });
  Question.findBySurveyId.mockResolvedValue([{ questionId: 8, surveyId: 4 }]);
  Response.hasResponded.mockResolvedValue(false);
  Response.insert.mockResolvedValue(15);
  Response.findById.mockResolvedValue({ responseId: 15 });
  Answer.findByResponseId.mockResolvedValue([]);
});

test('survey creation inserts survey and questions in one transaction', async () => {
  Survey.insert.mockResolvedValue(4);
  await Service.createSurvey({ data: {
    name: 'Survey', questions: [{ questionText: 'Question', questionType: 'text', orderInSurvey: 1 }]
  } });
  expect(Survey.insert).toHaveBeenCalledWith(expect.objectContaining({ name: 'Survey' }), { tx });
  expect(Question.insert).toHaveBeenCalledWith(expect.objectContaining({ surveyId: 4 }), { tx });
});

test('survey submission validates question membership and writes with one transaction', async () => {
  await Service.submitSurvey({ surveyId: 4, data: {
    respondentId: 'visitor', answers: [{ questionId: 8, answerText: 'Answer' }]
  } });
  expect(Response.insert).toHaveBeenCalledWith(expect.objectContaining({ surveyId: 4 }), { tx });
  expect(Answer.insertMany).toHaveBeenCalledWith([
    expect.objectContaining({ responseId: 15, questionId: 8 })
  ], { tx });
});

test('foreign question is rejected without writing a response', async () => {
  await expect(Service.submitSurvey({ surveyId: 4, data: {
    answers: [{ questionId: 9, answerText: 'Answer' }]
  } })).rejects.toMatchObject({ code: 'VALIDATION' });
  expect(Response.insert).not.toHaveBeenCalled();
});
