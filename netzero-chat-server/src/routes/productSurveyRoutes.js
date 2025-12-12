const express = require('express');
const router = express.Router();
const ProductSurveyController = require('../controllers/ProductSurveyController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { body, param } = require('express-validator');

/**
 * Validation middleware for survey submission
 */
const validateSurveySubmission = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string'),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required for each answer')
    .isString()
    .withMessage('Question ID must be a string'),
  
  body('answers.*.score')
    .notEmpty()
    .withMessage('Score is required for each answer')
    .isFloat({ min: 1, max: 10 })
    .withMessage('Score must be a number between 1 and 10')
];

/**
 * Validation middleware for product ID parameter
 */
const validateProductId = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isString()
    .withMessage('Product ID must be a string')
];

/**
 * Validation middleware for survey response ID parameter
 */
const validateSurveyResponseId = [
  param('surveyResponseId')
    .notEmpty()
    .withMessage('Survey response ID is required')
    .isString()
    .withMessage('Survey response ID must be a string')
];

// =============================================================================
// ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/products/surveys/health
 * @desc    Health check for product survey service
 * @access  Public
 */
router.get('/surveys/health', ProductSurveyController.healthCheck);

/**
 * @route   GET /api/v1/products/surveys/questions
 * @desc    Get all active survey questions
 * @access  Public (or optionalAuth if you want to track usage)
 */
router.get('/surveys/questions', optionalAuth, ProductSurveyController.getQuestions);

/**
 * @route   GET /api/v1/products/surveys/:surveyResponseId
 * @desc    Get a specific survey response with answers
 * @access  Public (or authenticateToken for auth)
 */
router.get(
  '/surveys/:surveyResponseId',
  validateSurveyResponseId,
  optionalAuth,
  ProductSurveyController.getSurveyResponse
);

/**
 * @route   POST /api/v1/products/:productId/surveys
 * @desc    Submit product survey for AI evaluation (TAKES BODY OF ANSWERS)
 * @access  Public (or authenticateToken for auth)
 * @body    { "answers": [{ "questionId": "q1", "score": 8 }, ...] }
 */
router.post(
  '/:productId/surveys',
  validateSurveySubmission,
  optionalAuth,
  ProductSurveyController.submitSurvey
);

/**
 * @route   GET /api/v1/products/:productId/surveys
 * @desc    Get survey history for a product
 * @access  Public (or authenticateToken for auth)
 */
router.get(
  '/:productId/surveys',
  validateProductId,
  optionalAuth,
  ProductSurveyController.getSurveyHistory
);

module.exports = router;
