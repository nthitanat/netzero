const express = require('express');
const SurveyController = require('../controllers/SurveyController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  surveyIdParams,
  listSurveyQuery,
  responseQuery,
  questionBody,
  createSurveyBody,
  updateSurveyBody,
  submitSurveyBody
} = require('../validators/surveyValidator');

const router = express.Router();

router.get('/', validateRequest({ query: listSurveyQuery }), asyncHandler(SurveyController.getAllSurveys));
router.get('/:id', validateRequest({ params: surveyIdParams }), asyncHandler(SurveyController.getSurveyById));
router.post('/:id/submit', optionalAuth, validateRequest({ params: surveyIdParams, body: submitSurveyBody }), asyncHandler(SurveyController.submitSurvey));
router.post('/', authenticateToken, validateRequest({ body: createSurveyBody }), asyncHandler(SurveyController.createSurvey));
router.put('/:id', authenticateToken, validateRequest({ params: surveyIdParams, body: updateSurveyBody }), asyncHandler(SurveyController.updateSurvey));
router.delete('/:id', authenticateToken, validateRequest({ params: surveyIdParams }), asyncHandler(SurveyController.deleteSurvey));
router.post('/:id/questions', authenticateToken, validateRequest({ params: surveyIdParams, body: questionBody }), asyncHandler(SurveyController.addQuestion));
router.get('/:id/responses', authenticateToken, validateRequest({ params: surveyIdParams, query: responseQuery }), asyncHandler(SurveyController.getSurveyResponses));
router.get('/:id/analytics', authenticateToken, validateRequest({ params: surveyIdParams }), asyncHandler(SurveyController.getSurveyAnalytics));

module.exports = router;
