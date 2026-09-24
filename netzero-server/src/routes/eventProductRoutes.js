const express = require('express');
const EventProductController = require('../controllers/EventProductController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  eventProductIdParams,
  productIdParams,
  eventIdParams,
  eventProductFilters,
  createEventProductBody,
  updateEventProductBody,
  patchEventProductBody
} = require('../validators/eventProductValidator');

const router = express.Router();

router.get('/', validateRequest({ query: eventProductFilters }), asyncHandler(EventProductController.getAllEventProducts));
router.get('/product/:productId/events', validateRequest({ params: productIdParams }), asyncHandler(EventProductController.getEventsByProductId));
router.get('/event/:eventId/products', validateRequest({ params: eventIdParams }), asyncHandler(EventProductController.getProductsByEventId));
router.get('/:id', validateRequest({ params: eventProductIdParams }), asyncHandler(EventProductController.getEventProductById));
router.post('/', authenticateToken, validateRequest({ body: createEventProductBody }), asyncHandler(EventProductController.createEventProduct));
router.put('/:id', authenticateToken, validateRequest({ params: eventProductIdParams, body: updateEventProductBody }), asyncHandler(EventProductController.updateEventProduct));
router.patch('/:id', authenticateToken, validateRequest({ params: eventProductIdParams, body: patchEventProductBody }), asyncHandler(EventProductController.patchEventProduct));
router.delete('/:id', authenticateToken, validateRequest({ params: eventProductIdParams }), asyncHandler(EventProductController.deleteEventProduct));

module.exports = router;
