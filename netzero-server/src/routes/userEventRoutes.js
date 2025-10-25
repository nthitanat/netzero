const express = require('express');
const router = express.Router();
const UserEventController = require('../controllers/UserEventController');
const { authenticateToken } = require('../middleware/auth');
const { checkEventOwnership, checkEventOwnershipOrAdmin, optionalEventOwnership } = require('../middleware/eventOwnership');

// Get all events for a specific user
router.get('/user/:userId/events', UserEventController.getUserEvents);

// Join an event (create user-event relationship)
router.post('/join', authenticateToken, UserEventController.joinEvent);

// Leave an event (remove user-event relationship)
router.delete('/user/:userId/event/:eventId', authenticateToken, UserEventController.leaveEvent);

// Get all users for a specific event
router.get('/event/:eventId/users', UserEventController.getEventUsers);

// Check if user owns/is associated with an event
router.get('/user/:userId/event/:eventId/ownership', UserEventController.checkOwnership);

// Protected route: Get events owned by authenticated user
router.get('/my-events', authenticateToken, UserEventController.getMyEvents);

module.exports = router;