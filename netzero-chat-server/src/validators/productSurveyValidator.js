function rejectValidation(res, message) {
  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: [{ msg: message }],
    timestamp: new Date().toISOString()
  });
}

function validateProductId(req, res, next) {
  const productId = req.params.productId;
  if (typeof productId !== 'string' || !productId.trim()) {
    return rejectValidation(res, 'Product ID is required');
  }
  req.validated = { ...(req.validated || {}), params: { productId: productId.trim() } };
  next();
}

function validateSurveyResponseId(req, res, next) {
  const surveyResponseId = req.params.surveyResponseId;
  if (typeof surveyResponseId !== 'string' || !surveyResponseId.trim()) {
    return rejectValidation(res, 'Survey response ID is required');
  }
  req.validated = { ...(req.validated || {}), params: { surveyResponseId: surveyResponseId.trim() } };
  next();
}

function validateSurveySubmission(req, res, next) {
  const requestBody = req.body || {};
  if (!Array.isArray(requestBody.answers) || requestBody.answers.length === 0) {
    return rejectValidation(res, 'Answers must be a non-empty array');
  }
  const answers = [];
  for (const answer of requestBody.answers) {
    if (!answer || typeof answer.questionId !== 'string' || !answer.questionId.trim()) {
      return rejectValidation(res, 'Question ID is required for each answer');
    }
    const score = Number(answer.score);
    if (!['number', 'string'].includes(typeof answer.score)
      || !Number.isFinite(score) || score < 1 || score > 10) {
      return rejectValidation(res, 'Score must be a number between 1 and 10');
    }
    if (answer.comment != null && typeof answer.comment !== 'string') {
      return rejectValidation(res, 'Comment must be text');
    }
    answers.push({
      questionId: answer.questionId.trim(),
      score,
      comment: answer.comment ?? null
    });
  }
  req.validated = { ...(req.validated || {}), body: { answers } };
  next();
}

module.exports = {
  validateProductId,
  validateSurveyResponseId,
  validateSurveySubmission
};
