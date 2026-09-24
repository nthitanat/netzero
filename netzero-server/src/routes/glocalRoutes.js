const express = require('express');
const GlocalController = require('../controllers/GlocalController');
const { authenticateToken, authorizeRoles, authenticateSurveyMonkeyWebhook } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  checkinIdParams,
  verifyCheckinBody,
  checkinFilters,
  createCheckinBody,
  updateCheckinBody,
  webhookBody
} = require('../validators/glocalCheckinValidator');

const router = express.Router();
const adminOnly = [authenticateToken, authorizeRoles('admin')];

router.post('/survey-checkins/verify', validateRequest({ body: verifyCheckinBody }), asyncHandler(GlocalController.verifyCheckin));
router.get('/survey-checkins', ...adminOnly, validateRequest({ query: checkinFilters }), asyncHandler(GlocalController.listCheckins));
router.get('/survey-checkins/:id', ...adminOnly, validateRequest({ params: checkinIdParams }), asyncHandler(GlocalController.getCheckinById));
router.post('/survey-checkins', ...adminOnly, validateRequest({ body: createCheckinBody }), asyncHandler(GlocalController.createCheckin));
router.patch('/survey-checkins/:id', ...adminOnly, validateRequest({ params: checkinIdParams, body: updateCheckinBody }), asyncHandler(GlocalController.updateCheckin));
router.delete('/survey-checkins/:id', ...adminOnly, validateRequest({ params: checkinIdParams }), asyncHandler(GlocalController.deleteCheckin));
router.post('/webhooks/surveymonkey', authenticateSurveyMonkeyWebhook, validateRequest({ body: webhookBody }), asyncHandler(GlocalController.receiveWebhook));

module.exports = router;
