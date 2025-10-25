const express = require('express');
const router = express.Router();
const EventProductController = require('../controllers/EventProductController');
const { authenticateToken, checkEventOwnership } = require('../middleware/auth');

// Public routes (no authentication required)

// GET /api/v1/event-products - Get all event products with optional filters
router.get('/', EventProductController.getAllEventProducts);

// GET /api/v1/event-products/product/:productId/events - Get all events for a specific product
router.get('/product/:productId/events', EventProductController.getEventsByProductId);

// GET /api/v1/event-products/event/:eventId/products - Get all products for a specific event
router.get('/event/:eventId/products', EventProductController.getProductsByEventId);

// GET /api/v1/event-products/:id - Get event product by ID
router.get('/:id', EventProductController.getEventProductById);

// Protected routes (authentication required)

// POST /api/v1/event-products - Create a new event product
// Uses checkEventOwnership middleware to determine status (confirmed if owner, pending otherwise)
router.post('/', authenticateToken, checkEventOwnership, EventProductController.createEventProduct);

// PUT /api/v1/event-products/:id - Update event product
// Uses checkEventOwnership middleware to check if user can confirm the product
router.put('/:id', authenticateToken, checkEventOwnership, EventProductController.updateEventProduct);

// DELETE /api/v1/event-products/:id - Delete event product
router.delete('/:id', authenticateToken, EventProductController.deleteEventProduct);

module.exports = router;
