const express = require('express');
const ReservationController = require('../controllers/ProductReservationController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const {
  reservationIdParams,
  reservationFilters,
  statusFilter,
  createReservationBody,
  updateReservationBody,
  updateStatusBody
} = require('../validators/reservationValidator');

const router = express.Router();
router.use(authenticateToken);

router.get('/', validateRequest({ query: reservationFilters }), asyncHandler(ReservationController.getAllReservations));
router.get('/my', validateRequest({ query: statusFilter }), asyncHandler(ReservationController.getMyReservations));
router.get('/my-products', validateRequest({ query: statusFilter }), asyncHandler(ReservationController.getMyProductReservations));
router.get('/stats', asyncHandler(ReservationController.getReservationStats));
router.get('/:id', validateRequest({ params: reservationIdParams }), asyncHandler(ReservationController.getReservationById));
router.post('/', validateRequest({ body: createReservationBody }), asyncHandler(ReservationController.createReservation));
router.put('/:id', validateRequest({ params: reservationIdParams, body: updateReservationBody }), asyncHandler(ReservationController.updateReservation));
router.delete('/:id', validateRequest({ params: reservationIdParams }), asyncHandler(ReservationController.deleteReservation));
router.post('/:id/confirm', validateRequest({ params: reservationIdParams }), asyncHandler(ReservationController.confirmReservation));
router.post('/:id/cancel', validateRequest({ params: reservationIdParams }), asyncHandler(ReservationController.cancelReservation));
router.put('/:id/status', validateRequest({ params: reservationIdParams, body: updateStatusBody }), asyncHandler(ReservationController.updateReservationStatus));

module.exports = router;
