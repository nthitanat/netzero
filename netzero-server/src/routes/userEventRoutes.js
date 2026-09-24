const express = require('express');
const UserEventController = require('../controllers/UserEventController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  userIdParams,
  eventIdParams,
  userEventParams,
  joinEventBody
} = require('../validators/userEventValidator');

const router = express.Router();

router.get('/my-events', authenticateToken, asyncHandler(UserEventController.getMyEvents));
router.get('/user/:userId/events', validateRequest({ params: userIdParams }), asyncHandler(UserEventController.getUserEvents));
router.post('/join', authenticateToken, validateRequest({ body: joinEventBody }), asyncHandler(UserEventController.joinEvent));
router.delete('/user/:userId/event/:eventId', authenticateToken, validateRequest({ params: userEventParams }), asyncHandler(UserEventController.leaveEvent));
router.get('/event/:eventId/users', validateRequest({ params: eventIdParams }), asyncHandler(UserEventController.getEventUsers));
router.get('/user/:userId/event/:eventId/ownership', validateRequest({ params: userEventParams }), asyncHandler(UserEventController.checkOwnership));

module.exports = router;
