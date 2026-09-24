const express = require('express');
const ProductSurveyController = require('../controllers/ProductSurveyController');
const { optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateProductId,
  validateSurveyResponseId,
  validateSurveySubmission
} = require('../validators/productSurveyValidator');

const router = express.Router();

router.get('/surveys/health', asyncHandler(ProductSurveyController.healthCheck));
router.get('/surveys/questions', optionalAuth, asyncHandler(ProductSurveyController.getQuestions));
router.get('/surveys/:surveyResponseId', validateSurveyResponseId, optionalAuth, asyncHandler(ProductSurveyController.getSurveyResponse));
router.post('/:productId/surveys', validateProductId, validateSurveySubmission, optionalAuth, asyncHandler(ProductSurveyController.submitSurvey));
router.get('/:productId/surveys', validateProductId, optionalAuth, asyncHandler(ProductSurveyController.getSurveyHistory));

module.exports = router;
