const ReservationService = require('../services/ReservationService');
const { sendSuccess } = require('../middleware/response');

function serializeReservation(reservation) {
  return {
    reservation_id: reservation.reservationId,
    user_id: reservation.customerId,
    product_id: reservation.productId,
    event_id: reservation.eventId,
    quantity: reservation.quantity,
    reserved_unit_price: reservation.reservedUnitPrice,
    note: reservation.note,
    shipping_address: reservation.shippingAddress,
    option_of_delivery: reservation.optionOfDelivery,
    user_note: reservation.userNote,
    seller_note: reservation.sellerNote,
    pickup_date: reservation.pickupDate,
    status: reservation.status,
    created_at: reservation.createdAt,
    updated_at: reservation.updatedAt,
    product: {
      id: reservation.product.id,
      title: reservation.product.title,
      price: reservation.product.price,
      type: reservation.product.type,
      owner_id: reservation.product.ownerId
    },
    customer: reservation.customer,
    owner: reservation.owner,
    event: reservation.event && {
      id: reservation.event.id,
      title: reservation.event.title,
      location: reservation.event.location,
      event_date: reservation.event.eventDate
    }
  };
}

function serializeProduct(product) {
  return {
    id: product.productId,
    project_id: product.projectId,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    type: product.type,
    address: product.address,
    coordinate: product.coordinate,
    stock_quantity: product.stockQuantity,
    unassigned_stock_quantity: product.unassignedStockQuantity,
    isRecommend: product.isRecommended,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    user_id: product.ownerId,
    owner: product.owner
  };
}

function mapReservationInput(body) {
  return {
    productId: body.product_id,
    eventId: body.event_id ?? null,
    quantity: body.quantity,
    reservedUnitPrice: body.reserved_unit_price,
    note: body.note,
    shippingAddress: body.shipping_address,
    optionOfDelivery: body.option_of_delivery,
    userNote: body.user_note,
    pickupDate: body.pickup_date ?? null
  };
}

function mapReservationUpdates(body) {
  const fields = {
    quantity: 'quantity',
    note: 'note',
    shipping_address: 'shippingAddress',
    option_of_delivery: 'optionOfDelivery',
    user_note: 'userNote',
    seller_note: 'sellerNote',
    pickup_date: 'pickupDate',
    status: 'status'
  };
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([apiName]) => body[apiName] !== undefined)
      .map(([apiName, domainName]) => [domainName, body[apiName]])
  );
}

async function getAllReservations(req, res) {
  const query = req.validated.query;
  const filters = {
    customerId: query.user_id,
    productId: query.product_id,
    ownerId: query.product_owner_id,
    status: query.status,
    limit: query.limit,
    offset: query.offset
  };
  const reservations = await ReservationService.listReservations({ actor: req.user, filters });
  return sendSuccess(res, {
    message: 'Reservations retrieved successfully',
    data: reservations.map(serializeReservation),
    count: reservations.length,
    filters: Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined))
  });
}

async function getReservationById(req, res) {
  const reservation = await ReservationService.getReservationById({
    actor: req.user,
    reservationId: req.validated.params.id
  });
  return sendSuccess(res, {
    message: 'Reservation retrieved successfully',
    data: serializeReservation(reservation)
  });
}

async function createReservation(req, res) {
  const reservation = await ReservationService.createReservation({
    actor: req.user,
    data: mapReservationInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Reservation created successfully',
    data: serializeReservation(reservation),
    statusCode: 201
  });
}

async function updateReservation(req, res) {
  const reservation = await ReservationService.updateReservation({
    actor: req.user,
    reservationId: req.validated.params.id,
    updates: mapReservationUpdates(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Reservation updated successfully',
    data: serializeReservation(reservation)
  });
}

async function deleteReservation(req, res) {
  await ReservationService.deleteReservation({
    actor: req.user,
    reservationId: req.validated.params.id
  });
  return sendSuccess(res, { message: 'Reservation deleted successfully' });
}

async function getMyReservations(req, res) {
  const reservations = await ReservationService.getMyReservations({
    actor: req.user,
    status: req.validated.query.status
  });
  return sendSuccess(res, {
    message: 'User reservations retrieved successfully',
    data: reservations.map(serializeReservation),
    count: reservations.length
  });
}

async function getMyProductReservations(req, res) {
  const reservations = await ReservationService.getMyProductReservations({
    actor: req.user,
    status: req.validated.query.status
  });
  return sendSuccess(res, {
    message: 'Product reservations retrieved successfully',
    data: reservations.map(serializeReservation),
    count: reservations.length
  });
}

async function confirmReservation(req, res) {
  const reservation = await ReservationService.confirmReservation({
    actor: req.user,
    reservationId: req.validated.params.id
  });
  return sendSuccess(res, {
    message: 'Reservation confirmed successfully',
    data: serializeReservation(reservation)
  });
}

async function cancelReservation(req, res) {
  const reservation = await ReservationService.cancelReservation({
    actor: req.user,
    reservationId: req.validated.params.id
  });
  return sendSuccess(res, {
    message: 'Reservation cancelled successfully',
    data: serializeReservation(reservation)
  });
}

async function updateReservationStatus(req, res) {
  const reservation = await ReservationService.updateReservationStatus({
    actor: req.user,
    reservationId: req.validated.params.id,
    status: req.validated.body.status
  });
  return sendSuccess(res, {
    message: 'Reservation status updated successfully',
    data: serializeReservation(reservation)
  });
}

async function getReservationStats(req, res) {
  const stats = await ReservationService.getReservationStats({ actor: req.user });
  return sendSuccess(res, {
    message: 'Reservation statistics retrieved successfully',
    data: {
      total_reservations: stats.totalReservations,
      pending_count: stats.pendingCount,
      confirmed_count: stats.confirmedCount,
      cancelled_count: stats.cancelledCount
    }
  });
}

async function getProductReservations(req, res) {
  const { product, reservations } = await ReservationService.getProductReservations({
    actor: req.user,
    productId: req.validated.params.productId
  });
  return sendSuccess(res, {
    message: 'Product reservations retrieved successfully',
    data: reservations.map(serializeReservation),
    count: reservations.length,
    product: serializeProduct(product)
  });
}

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getMyReservations,
  getMyProductReservations,
  confirmReservation,
  cancelReservation,
  updateReservationStatus,
  getReservationStats,
  getProductReservations
};
