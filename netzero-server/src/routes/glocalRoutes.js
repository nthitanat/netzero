const express = require('express');
const router = express.Router();
const GlocalController = require('../controllers/GlocalController');
const {
  authenticateToken,
  authorizeRoles,
  authenticateSurveyMonkeyWebhook
} = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES (No authentication required)
// ===========================================

// POST /api/v1/glocal/survey-checkins/verify - anonymous check-in verification
// used by the frontend /check-in page (covered by the global apiLimiter).
router.post('/survey-checkins/verify', GlocalController.verifyCheckin);

// ===========================================
// ADMIN ROUTES (survey_checkins CRUD)
// ===========================================

// GET /api/v1/glocal/survey-checkins - list check-ins
router.get(
  '/survey-checkins',
  authenticateToken,
  authorizeRoles('admin'),
  GlocalController.listCheckins
);

// GET /api/v1/glocal/survey-checkins/:id - get check-in by id
router.get(
  '/survey-checkins/:id',
  authenticateToken,
  authorizeRoles('admin'),
  GlocalController.getCheckinById
);

// POST /api/v1/glocal/survey-checkins - create check-in
router.post(
  '/survey-checkins',
  authenticateToken,
  authorizeRoles('admin'),
  GlocalController.createCheckin
);

// PATCH /api/v1/glocal/survey-checkins/:id - update check-in
router.patch(
  '/survey-checkins/:id',
  authenticateToken,
  authorizeRoles('admin'),
  GlocalController.updateCheckin
);

// DELETE /api/v1/glocal/survey-checkins/:id - delete check-in
router.delete(
  '/survey-checkins/:id',
  authenticateToken,
  authorizeRoles('admin'),
  GlocalController.deleteCheckin
);

// ===========================================
// WEBHOOK (SurveyMonkey -> this server)
// ===========================================

// POST /api/v1/glocal/webhooks/surveymonkey - inbound SurveyMonkey webhook,
// authenticated via shared secret instead of JWT.
router.post(
  '/webhooks/surveymonkey',
  authenticateSurveyMonkeyWebhook,
  GlocalController.receiveWebhook
);

module.exports = router;
