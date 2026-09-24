const SurveyService = require('../services/SurveyService');
const { sendSuccess } = require('../middleware/response');
const {
  serializeQuestion,
  serializeSurvey,
  serializeResponse,
  serializeAnalytics
} = require('./surveySerializer');

function mapQuestionInput(question) {
  return {
    questionText: question.question_text,
    questionType: question.question_type,
    orderInSurvey: question.order_in_survey
  };
}

function mapSurveyInput(body) {
  return {
    ...('name' in body && { name: body.name }),
    ...('description' in body && { description: body.description }),
    ...('start_date' in body && { startDate: body.start_date }),
    ...('end_date' in body && { endDate: body.end_date }),
    ...('questions' in body && { questions: body.questions.map(mapQuestionInput) })
  };
}

async function getAllSurveys(req, res) {
  const surveys = await SurveyService.listSurveys({ filters: req.validated.query });
  return sendSuccess(res, {
    message: 'Surveys retrieved successfully',
    data: surveys.map(serializeSurvey),
    count: surveys.length
  });
}

async function getSurveyById(req, res) {
  const survey = await SurveyService.getSurveyById({ surveyId: req.validated.params.id });
  return sendSuccess(res, { message: 'Survey retrieved successfully', data: serializeSurvey(survey) });
}

async function createSurvey(req, res) {
  const survey = await SurveyService.createSurvey({ data: mapSurveyInput(req.validated.body) });
  return sendSuccess(res, {
    message: 'Survey created successfully',
    data: serializeSurvey(survey),
    statusCode: 201
  });
}

async function updateSurvey(req, res) {
  const survey = await SurveyService.updateSurvey({
    surveyId: req.validated.params.id,
    updates: mapSurveyInput(req.validated.body)
  });
  return sendSuccess(res, { message: 'Survey updated successfully', data: serializeSurvey(survey) });
}

async function deleteSurvey(req, res) {
  await SurveyService.deleteSurvey({ surveyId: req.validated.params.id });
  return sendSuccess(res, { message: 'Survey deleted successfully' });
}

async function addQuestion(req, res) {
  const question = await SurveyService.addQuestion({
    surveyId: req.validated.params.id,
    data: mapQuestionInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Question added successfully',
    data: serializeQuestion(question),
    statusCode: 201
  });
}

async function submitSurvey(req, res) {
  const { respondent_id: respondentId, answers } = req.validated.body;
  const response = await SurveyService.submitSurvey({
    surveyId: req.validated.params.id,
    actor: req.user,
    data: {
      respondentId: respondentId == null ? null : String(respondentId),
      answers: answers.map(answer => ({
        questionId: answer.question_id,
        answerText: answer.answer_text,
        answerChoiceId: answer.answer_choice_id
      }))
    }
  });
  return sendSuccess(res, {
    message: 'Survey submitted successfully',
    data: serializeResponse(response),
    statusCode: 201
  });
}

async function getSurveyResponses(req, res) {
  const responses = await SurveyService.listSurveyResponses({
    surveyId: req.validated.params.id,
    filters: req.validated.query
  });
  return sendSuccess(res, {
    message: 'Survey responses retrieved successfully',
    data: responses.map(serializeResponse),
    count: responses.length
  });
}

async function getSurveyAnalytics(req, res) {
  const analytics = await SurveyService.getSurveyAnalytics({ surveyId: req.validated.params.id });
  return sendSuccess(res, {
    message: 'Survey analytics retrieved successfully',
    data: serializeAnalytics(analytics)
  });
}

module.exports = {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  addQuestion,
  submitSurvey,
  getSurveyResponses,
  getSurveyAnalytics
};
