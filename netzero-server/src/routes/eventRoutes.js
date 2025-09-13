const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');

// GET /api/v1/events - Get all events
router.get('/', EventController.getAllEvents);

// GET /api/v1/events/category/:category - Get events by category
router.get('/category/:category', EventController.getEventsByCategory);

// GET /api/v1/events/recommended - Get recommended events
router.get('/recommended', EventController.getRecommendedEvents);

// GET /api/v1/events/search/:name - Get events by name
router.get('/search/:name', EventController.getEventByName);

// GET /api/v1/events/:id - Get event by ID (must be after specific routes)
router.get('/:id', EventController.getEventById);

// GET /api/v1/events/:id/poster - Get event poster image
router.get('/:id/poster', EventController.getEventPosterImage);
router.options('/:id/poster', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.sendStatus(200);
});

// GET /api/v1/events/:id/thumbnail - Get event thumbnail image
router.get('/:id/thumbnail', EventController.getEventThumbnail);
router.options('/:id/thumbnail', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.sendStatus(200);
});

module.exports = router;
