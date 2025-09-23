const express = require('express');
const router = express.Router();
const ProductReservationController = require('../controllers/ProductReservationController');
const { authenticateToken } = require('../middleware/auth');

// All reservation routes require authentication

// GET /api/v1/reservations - Get all reservations (with filters)
router.get('/', authenticateToken, ProductReservationController.getAllReservations);

// GET /api/v1/reservations/my - Get current user's reservations
router.get('/my', authenticateToken, ProductReservationController.getMyReservations);

// GET /api/v1/reservations/my-products - Get reservations for current user's products (seller view)
router.get('/my-products', authenticateToken, ProductReservationController.getMyProductReservations);

// GET /api/v1/reservations/stats - Get reservation statistics for current user (as product owner)
router.get('/stats', authenticateToken, ProductReservationController.getReservationStats);

// GET /api/v1/reservations/:id - Get reservation by ID
router.get('/:id', authenticateToken, ProductReservationController.getReservationById);

// POST /api/v1/reservations - Create a new reservation
router.post('/', authenticateToken, ProductReservationController.createReservation);

// PUT /api/v1/reservations/:id - Update reservation
router.put('/:id', authenticateToken, ProductReservationController.updateReservation);

// DELETE /api/v1/reservations/:id - Delete reservation
router.delete('/:id', authenticateToken, ProductReservationController.deleteReservation);

// POST /api/v1/reservations/:id/confirm - Confirm reservation and reduce stock
router.post('/:id/confirm', authenticateToken, ProductReservationController.confirmReservation);

// POST /api/v1/reservations/:id/cancel - Cancel reservation
router.post('/:id/cancel', authenticateToken, ProductReservationController.cancelReservation);

// PUT /api/v1/reservations/:id/status - Update reservation status (for product owners)
router.put('/:id/status', authenticateToken, ProductReservationController.updateReservationStatus);

module.exports = router;