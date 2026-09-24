const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');
const config = require('../config/env');
const Survey = require('../models/survey/Survey');
const Question = require('../models/survey/Question');
const Response = require('../models/survey/Response');
const Answer = require('../models/survey/Answer');

function assertDateOrder({ startDate, endDate }) {
  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    throw applicationError('VALIDATION', 'End date must be after start date');
  }
}

async function requireSurvey(surveyId, options = {}) {
  const survey = await Survey.findById(surveyId, options);
  if (!survey) throw applicationError('NOT_FOUND', 'Survey not found');
  return survey;
}

function isSurveyActive(survey) {
  const now = new Date();
  return (!survey.startDate || new Date(survey.startDate) <= now)
    && (!survey.endDate || new Date(survey.endDate) >= now);
}

async function listSurveys({ filters }) {
  return Survey.findAll(filters);
}

async function getSurveyById({ surveyId }) {
  const survey = await requireSurvey(surveyId);
  const questions = await Question.findBySurveyId(surveyId);
  return { ...survey, questions };
}

async function createSurvey({ data }) {
  assertDateOrder(data);
  return withTransaction(async tx => {
    const surveyId = await Survey.insert(data, { tx });
    for (const [index, question] of data.questions.entries()) {
      await Question.insert({
        surveyId,
        questionText: question.questionText,
        questionType: question.questionType || 'text',
        orderInSurvey: question.orderInSurvey ?? index + 1
      }, { tx });
    }
    const survey = await Survey.findById(surveyId, { tx });
    const questions = await Question.findBySurveyId(surveyId, { tx });
    return { ...survey, questions };
  });
}

async function updateSurvey({ surveyId, updates }) {
  const survey = await requireSurvey(surveyId);
  const updatedSurvey = { ...survey, ...updates };
  assertDateOrder(updatedSurvey);
  await Survey.updateById(surveyId, updatedSurvey);
  return requireSurvey(surveyId);
}

async function deleteSurvey({ surveyId }) {
  await requireSurvey(surveyId);
  const isDeleted = await Survey.deleteById(surveyId);
  if (!isDeleted) throw applicationError('CONFLICT', 'Survey could not be deleted');
}

async function addQuestion({ surveyId, data }) {
  await requireSurvey(surveyId);
  const questionId = await Question.insert({ surveyId, ...data });
  return Question.findById(questionId);
}

async function submitSurvey({ surveyId, actor, data }) {
  return withTransaction(async tx => {
    const survey = await requireSurvey(surveyId, { tx, forUpdate: true });
    if (!isSurveyActive(survey)) {
      throw applicationError('VALIDATION', 'Survey is not currently active');
    }
    const userId = actor?.userId ?? actor?.id ?? null;
    const hasResponded = await Response.hasResponded({
      surveyId,
      userId,
      respondentId: data.respondentId
    }, { tx });
    if (hasResponded) {
      throw applicationError('CONFLICT', 'You have already submitted a response to this survey');
    }
    const questions = await Question.findBySurveyId(surveyId, { tx });
    const validQuestionIds = new Set(questions.map(question => question.questionId));
    const answeredQuestionIds = data.answers.map(answer => answer.questionId);
    if (answeredQuestionIds.some(questionId => !validQuestionIds.has(questionId))
      || new Set(answeredQuestionIds).size !== answeredQuestionIds.length) {
      throw applicationError('VALIDATION', 'Answers must refer to distinct questions in this survey');
    }
    const responseId = await Response.insert({
      surveyId,
      userId,
      respondentId: data.respondentId,
      submittedAt: new Date()
    }, { tx });
    await Answer.insertMany(data.answers.map(answer => ({ responseId, ...answer })), { tx });
    const response = await Response.findById(responseId, { tx });
    const answers = await Answer.findByResponseId(responseId, { tx });
    return { ...response, answers };
  });
}

async function listSurveyResponses({ surveyId, filters }) {
  await requireSurvey(surveyId);
  return Response.findBySurveyId(surveyId, filters);
}

async function getSurveyAnalytics({ surveyId }) {
  await requireSurvey(surveyId);
  const surveyStats = await Response.getStatsBySurveyId(surveyId);
  const questions = await Question.findBySurveyId(surveyId);
  const questionAnalytics = [];
  for (const question of questions) {
    const stats = await Answer.getStatsByQuestionId(question.questionId);
    const additionalData = question.questionType === 'multiple_choice'
      ? { choiceDistribution: await Answer.getChoiceDistribution(question.questionId) }
      : { textAnswers: await Answer.getTextAnswers(question.questionId, config.survey.analyticsTextLimit) };
    questionAnalytics.push({ question, stats, ...additionalData });
  }
  return { surveyStats, questionAnalytics };
}

module.exports = {
  listSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  addQuestion,
  submitSurvey,
  listSurveyResponses,
  getSurveyAnalytics
};
