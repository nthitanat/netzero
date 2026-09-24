const express = require('express');
const EventController = require('../controllers/EventController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  eventIdParams,
  categoryParams,
  eventNameParams,
  eventPageQuery,
  createEventBody,
  updateEventBody
} = require('../validators/eventValidator');

const router = express.Router();

function imageOptions(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  return res.sendStatus(200);
}

router.get('/', validateRequest({ query: eventPageQuery }), asyncHandler(EventController.getAllEvents));
router.get('/category/:category', validateRequest({ params: categoryParams, query: eventPageQuery }), asyncHandler(EventController.getEventsByCategory));
router.get('/recommended', validateRequest({ query: eventPageQuery }), asyncHandler(EventController.getRecommendedEvents));
router.get('/search/:name', validateRequest({ params: eventNameParams, query: eventPageQuery }), asyncHandler(EventController.getEventByName));
router.get('/:id/poster', validateRequest({ params: eventIdParams }), asyncHandler(EventController.getEventPosterImage));
router.options('/:id/poster', imageOptions);
router.get('/:id/thumbnail', validateRequest({ params: eventIdParams }), asyncHandler(EventController.getEventThumbnail));
router.options('/:id/thumbnail', imageOptions);
router.get('/:id', validateRequest({ params: eventIdParams }), asyncHandler(EventController.getEventById));
router.post('/', authenticateToken, validateRequest({ body: createEventBody }), asyncHandler(EventController.createEvent));
router.delete('/:id', authenticateToken, validateRequest({ params: eventIdParams }), asyncHandler(EventController.deleteEvent));
router.put('/:id/cancel', authenticateToken, validateRequest({ params: eventIdParams }), asyncHandler(EventController.cancelEvent));
router.put('/:id', authenticateToken, validateRequest({ params: eventIdParams, body: updateEventBody }), asyncHandler(EventController.updateEvent));

module.exports = router;
