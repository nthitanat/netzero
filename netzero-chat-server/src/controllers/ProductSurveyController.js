const AiProductSurveyService = require('../services/AiProductSurveyService');
const { sendSuccess } = require('../middleware/response');

function serializeQuestion(question) {
  return {
    id: question.id,
    questionId: question.questionId,
    questionText: question.questionText,
    scoringCriteria: question.scoringCriteria,
    weight: question.weight,
    criterionCode: question.criterionCode,
    criterionNameTh: question.criterionNameTh,
    standardReference: question.standardReference,
    displayOrder: question.displayOrder
  };
}

function serializeAnswer(answer) {
  return {
    id: answer.answerId,
    survey_response_id: answer.surveyResponseId,
    question_id: answer.questionId,
    score: answer.score,
    comment: answer.comment,
    question_text: answer.questionText,
    weight: answer.weight,
    created_at: answer.createdAt,
    updated_at: answer.updatedAt
  };
}

function serializeResponse(response) {
  return {
    id: response.surveyResponseId,
    product_id: response.productId,
    status: response.status,
    alignment_level: response.alignmentLevel,
    overall_score: response.overallScore,
    ai_comment: response.aiComment,
    ai_raw_result: response.aiRawResult,
    criteria_breakdown: response.criteriaBreakdown,
    trial_count: response.trialCount,
    created_at: response.createdAt,
    updated_at: response.updatedAt,
    ...(response.answers && { answers: response.answers.map(serializeAnswer) })
  };
}

async function submitSurvey(req, res) {
  const result = await AiProductSurveyService.evaluateProductSurvey({
    productId: req.validated.params.productId,
    answers: req.validated.body.answers
  });
  return sendSuccess(res, {
    message: 'Survey evaluated successfully',
    statusCode: 201,
    data: {
      surveyResponseId: result.surveyResponseId,
      productId: result.productId,
      status: result.status,
      alignmentLevel: result.alignmentLevel,
      overallScore: result.overallScore,
      aiComment: result.aiComment,
      criteriaBreakdown: result.criteriaBreakdown,
      aiRawResult: result.aiRawResult
    }
  });
}

async function getSurveyHistory(req, res) {
  const productId = req.validated.params.productId;
  const history = await AiProductSurveyService.getProductSurveyHistory({ productId });
  return sendSuccess(res, {
    message: 'Survey history retrieved successfully',
    data: { productId, surveyCount: history.length, surveys: history.map(serializeResponse) }
  });
}

async function getSurveyResponse(req, res) {
  const response = await AiProductSurveyService.getSurveyResponse({
    surveyResponseId: req.validated.params.surveyResponseId
  });
  return sendSuccess(res, {
    message: 'Survey response retrieved successfully',
    data: serializeResponse(response)
  });
}

async function getQuestions(req, res) {
  const questions = await AiProductSurveyService.listQuestions();
  return sendSuccess(res, {
    message: 'Survey questions retrieved successfully',
    data: { questionCount: questions.length, questions: questions.map(serializeQuestion) }
  });
}

async function healthCheck(req, res) {
  const health = await AiProductSurveyService.healthCheck();
  return sendSuccess(res, { message: 'Product Survey service is healthy', data: health });
}

module.exports = {
  submitSurvey,
  getSurveyHistory,
  getSurveyResponse,
  getQuestions,
  healthCheck
};
