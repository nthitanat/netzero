const ProductSurvey = require('../models/ProductSurvey');
const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');
const { buildEvaluationPrompt } = require('./productSurveyPrompt');
const productSurveyAiClient = require('../adapters/productSurveyAiClient');
const config = require('../config/env');

function validateAnswers({ answers, questions }) {
  const questionIds = answers.map(answer => answer.questionId);
  if (new Set(questionIds).size !== questionIds.length) {
    throw applicationError('VALIDATION', 'Duplicate question IDs found in answers');
  }
  const questionByCode = new Map(questions.map(question => [question.questionId, question]));
  for (const questionId of questionIds) {
    const question = questionByCode.get(questionId);
    if (!question) throw applicationError('NOT_FOUND', `Question not found: ${questionId}`);
    if (!question.isActive) throw applicationError('VALIDATION', `Inactive question: ${questionId}`);
  }
  return questionByCode;
}

function enrichAnswers(answers, questionByCode) {
  return answers.map(answer => {
    const question = questionByCode.get(answer.questionId);
    return {
      questionId: answer.questionId,
      questionText: question.questionText,
      scoringCriteria: question.scoringCriteria,
      weight: question.weight,
      score: answer.score,
      criterionCode: question.criterionCode,
      criterionNameTh: question.criterionNameTh,
      standardReference: question.standardReference
    };
  });
}

function mapAiResult(aiResult) {
  const { result, rawText } = aiResult;
  const statusByProviderValue = {
    pass: 'passed',
    fail: 'failed',
    passed: 'passed',
    failed: 'failed',
    needs_review: 'needs_review'
  };
  const alignmentLevels = new Set(['beginner', 'emerging', 'consistent']);
  return {
    status: statusByProviderValue[result.status] || 'needs_review',
    alignmentLevel: alignmentLevels.has(result.alignment_level) ? result.alignment_level : 'unknown',
    overallScore: Number(result.overall_score) || 0,
    aiComment: result.ai_comment || null,
    criteriaBreakdown: {
      criteria_scores: result.criteria_scores || {},
      sbti_compliance_summary: result.sbti_compliance_summary || {},
      risk_flags: result.risk_flags || [],
      recommendations: result.recommendations || []
    },
    aiRawResult: { ...result, rawText, timestamp: new Date().toISOString() }
  };
}

async function evaluateProductSurvey({ productId, answers }) {
  const questionIds = answers.map(answer => answer.questionId);
  const { surveyResponseId, questionByCode } = await withTransaction(async tx => {
    const product = await ProductSurvey.findProductForUpdate(productId, { tx });
    if (!product) throw applicationError('NOT_FOUND', `Product not found: ${productId}`);
    const questions = await ProductSurvey.findQuestionsByCodes(questionIds, { tx });
    const questionByCode = validateAnswers({ answers, questions });
    const trialCount = await ProductSurvey.getLatestTrialCount(productId, { tx }) + 1;
    const responseId = await ProductSurvey.insertResponse({
      productId, status: 'pending_ai', trialCount
    }, { tx });
    await ProductSurvey.insertAnswers(answers.map(answer => ({
      surveyResponseId: responseId,
      questionId: questionByCode.get(answer.questionId).id,
      score: answer.score,
      comment: answer.comment
    })), { tx });
    return { surveyResponseId: responseId, questionByCode };
  });

  const prompt = buildEvaluationPrompt({
    productId,
    answersWithQuestions: enrichAnswers(answers, questionByCode)
  });
  let aiResult;
  try {
    aiResult = await productSurveyAiClient.evaluateSurvey(prompt);
    if (!aiResult.result || typeof aiResult.result !== 'object' || Array.isArray(aiResult.result)) {
      throw new Error('AI response did not contain an evaluation object');
    }
  } catch (error) {
    await ProductSurvey.updateResponseById(surveyResponseId, {
      status: 'needs_review',
      aiComment: 'AI evaluation could not be completed'
    });
    if (error.statusCode) throw error;
    throw applicationError('AI_UNAVAILABLE', 'AI service temporarily unavailable', { cause: error });
  }
  return ProductSurvey.updateResponseById(surveyResponseId, mapAiResult(aiResult));
}

async function getProductSurveyHistory({ productId }) {
  return ProductSurvey.findResponsesByProductId(productId);
}

async function getSurveyResponse({ surveyResponseId }) {
  const response = await ProductSurvey.findResponseById(surveyResponseId);
  if (!response) throw applicationError('NOT_FOUND', `Survey response not found: ${surveyResponseId}`);
  const answers = await ProductSurvey.findAnswersByResponseId(surveyResponseId);
  return { ...response, answers };
}

async function listQuestions() {
  return ProductSurvey.findActiveQuestions();
}

async function healthCheck() {
  try {
    const questions = await ProductSurvey.findActiveQuestions();
    return {
      service: 'product-survey',
      database: 'connected',
      questionsAvailable: questions.length,
      aiService: config.openai.apiKey ? 'configured' : 'unconfigured'
    };
  } catch (error) {
    throw applicationError('EXTERNAL', 'Product Survey service is unhealthy', { cause: error });
  }
}

module.exports = {
  evaluateProductSurvey,
  getProductSurveyHistory,
  getSurveyResponse,
  listQuestions,
  healthCheck
};
