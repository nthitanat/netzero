const express = require('express');
const router = express.Router();
const SurveyController = require('../controllers/SurveyController');
const { authenticateToken } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (No authentication required)
// ===========================================

// GET /api/v1/surveys - Get all surveys (public view)
router.get('/', SurveyController.getAllSurveys);

// GET /api/v1/surveys/:id - Get survey by ID with questions (public view)
router.get('/:id', SurveyController.getSurveyById);

// POST /api/v1/surveys/:id/submit - Submit survey response (public, no auth required)
// This allows anonymous users to submit surveys
router.post('/:id/submit', SurveyController.submitSurvey);

// ===========================================
// PROTECTED ROUTES (Authentication required)
// ===========================================

// Survey Management (Admin/Creator only)
// POST /api/v1/surveys - Create new survey
router.post('/', authenticateToken, SurveyController.createSurvey);

// PUT /api/v1/surveys/:id - Update survey
router.put('/:id', authenticateToken, SurveyController.updateSurvey);

// DELETE /api/v1/surveys/:id - Delete survey
router.delete('/:id', authenticateToken, SurveyController.deleteSurvey);

// Question Management
// POST /api/v1/surveys/:id/questions - Add question to survey
router.post('/:id/questions', authenticateToken, SurveyController.addQuestion);

// Survey Analytics & Response Management
// GET /api/v1/surveys/:id/responses - Get all responses for a survey
router.get('/:id/responses', authenticateToken, SurveyController.getSurveyResponses);

// GET /api/v1/surveys/:id/analytics - Get survey analytics and statistics
router.get('/:id/analytics', authenticateToken, SurveyController.getSurveyAnalytics);

module.exports = router;