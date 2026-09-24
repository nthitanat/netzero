const config = require('../config/env');
const Reservation = require('../models/ProductReservation');
const ReservationStock = require('../models/ReservationStock');
const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
});

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function isAdmin(actor) {
  return actor.role === 'admin';
}

function canAccessReservation(actor, reservation) {
  const userId = actorId(actor);
  return isAdmin(actor) || reservation.customerId === userId || reservation.product.ownerId === userId;
}

function assertCanAccess(actor, reservation) {
  if (!canAccessReservation(actor, reservation)) {
    throw applicationError('FORBIDDEN', 'Access denied');
  }
}

function assertOwnerOrAdmin(actor, reservation) {
  if (!isAdmin(actor) && reservation.product.ownerId !== actorId(actor)) {
    throw applicationError('FORBIDDEN', 'Access denied. Only product owner can update reservation status');
  }
}

async function requireReservation(reservationId, context) {
  const reservation = await Reservation.findById(reservationId, context);
  if (!reservation) throw applicationError('NOT_FOUND', 'Reservation not found');
  return reservation;
}

async function requireLockedReservation(reservationId, tx) {
  if (!await Reservation.lockById(reservationId, { tx })) {
    throw applicationError('NOT_FOUND', 'Reservation not found');
  }
  return requireReservation(reservationId, { tx });
}

async function assertStockAvailable({ product, eventId, quantity, optionOfDelivery }, context) {
  if (optionOfDelivery === 'event') {
    const eventStock = await ReservationStock.findEventStock({ eventId, productId: product.productId }, context);
    if (!eventStock) {
      throw applicationError('NOT_FOUND', 'Product is not available for this event');
    }
    if (eventStock.stockQuantity < quantity) {
      throw applicationError('VALIDATION', `Insufficient event stock. Available: ${eventStock.stockQuantity}`);
    }
  } else if ((product.unassignedStockQuantity ?? 0) < quantity) {
    throw applicationError('VALIDATION', `Insufficient unassigned stock. Available: ${product.unassignedStockQuantity ?? 0}`);
  }
  if (product.stockQuantity < quantity) {
    throw applicationError('VALIDATION', `Insufficient stock. Available: ${product.stockQuantity}`);
  }
}

async function listReservations({ actor, filters = {} }) {
  const scope = isAdmin(actor) ? {} : { visibleToActorId: actorId(actor) };
  return Reservation.findAll({
    ...filters,
    ...scope,
    limit: Math.min(filters.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: filters.offset ?? 0
  });
}

async function getReservationById({ actor, reservationId }) {
  const reservation = await requireReservation(reservationId);
  assertCanAccess(actor, reservation);
  return reservation;
}

async function createReservation({ actor, data }) {
  const reservationId = await withTransaction(async (tx) => {
    const product = await ReservationStock.findProductById(data.productId, { tx });
    if (!product) throw applicationError('NOT_FOUND', 'Product not found');
    if (product.ownerId === actorId(actor)) {
      throw applicationError('VALIDATION', 'Cannot reserve your own product');
    }
    const eventId = data.optionOfDelivery === 'event' ? data.eventId : null;
    await assertStockAvailable({
      product,
      eventId,
      quantity: data.quantity,
      optionOfDelivery: data.optionOfDelivery
    }, { tx });
    return Reservation.insert({
      ...data,
      customerId: actorId(actor),
      eventId,
      status: STATUS.PENDING
    }, { tx });
  });
  return Reservation.findById(reservationId);
}

async function confirmWithinTransaction({ actor, reservation, tx }) {
  assertOwnerOrAdmin(actor, reservation);
  if (reservation.status !== STATUS.PENDING) {
    throw applicationError('CONFLICT', 'Only pending reservations can be confirmed');
  }
  const isEvent = reservation.optionOfDelivery === 'event' && reservation.eventId !== null;
  if (isEvent) {
    const didDecrementEvent = await ReservationStock.decrementEventStock({
      eventId: reservation.eventId,
      productId: reservation.productId,
      quantity: reservation.quantity
    }, { tx });
    if (!didDecrementEvent) throw applicationError('CONFLICT', 'Insufficient event stock available');
  }
  const didDecrementProduct = await ReservationStock.decrementProductStock({
    productId: reservation.productId,
    quantity: reservation.quantity,
    isEvent
  }, { tx });
  if (!didDecrementProduct) throw applicationError('CONFLICT', 'Insufficient stock available');
  if (!await Reservation.transitionPending(reservation.reservationId, STATUS.CONFIRMED, { tx })) {
    throw applicationError('CONFLICT', 'Only pending reservations can be confirmed');
  }
}

async function cancelWithinTransaction({ actor, reservation, tx }) {
  assertCanAccess(actor, reservation);
  if (reservation.status !== STATUS.PENDING) {
    throw applicationError('CONFLICT', 'Only pending reservations can be cancelled');
  }
  if (!await Reservation.transitionPending(reservation.reservationId, STATUS.CANCELLED, { tx })) {
    throw applicationError('CONFLICT', 'Only pending reservations can be cancelled');
  }
}

async function confirmReservation({ actor, reservationId }) {
  await withTransaction(async (tx) => {
    const reservation = await requireLockedReservation(reservationId, tx);
    await confirmWithinTransaction({ actor, reservation, tx });
  });
  return Reservation.findById(reservationId);
}

async function cancelReservation({ actor, reservationId }) {
  await withTransaction(async (tx) => {
    const reservation = await requireLockedReservation(reservationId, tx);
    await cancelWithinTransaction({ actor, reservation, tx });
  });
  return Reservation.findById(reservationId);
}

async function updateReservationStatus({ actor, reservationId, status }) {
  if (status === STATUS.CONFIRMED) return confirmReservation({ actor, reservationId });
  if (status === STATUS.CANCELLED) return cancelReservation({ actor, reservationId });
  const reservation = await requireReservation(reservationId);
  assertOwnerOrAdmin(actor, reservation);
  if (reservation.status !== STATUS.PENDING) {
    throw applicationError('CONFLICT', 'Reservation cannot return to pending');
  }
  return reservation;
}

async function updateReservation({ actor, reservationId, updates }) {
  await withTransaction(async (tx) => {
    let reservation = await requireLockedReservation(reservationId, tx);
    assertCanAccess(actor, reservation);
    const { status, ...fieldUpdates } = updates;
    if (fieldUpdates.quantity !== undefined && reservation.status !== STATUS.PENDING) {
      throw applicationError('CONFLICT', 'Only pending reservation quantity can be updated');
    }
    if (fieldUpdates.quantity !== undefined) {
      const product = await ReservationStock.findProductById(reservation.productId, { tx });
      if (!product) throw applicationError('NOT_FOUND', 'Product not found');
      await assertStockAvailable({
        product,
        eventId: reservation.eventId,
        quantity: fieldUpdates.quantity,
        optionOfDelivery: reservation.optionOfDelivery
      }, { tx });
    }
    if (fieldUpdates.optionOfDelivery !== undefined && fieldUpdates.optionOfDelivery !== reservation.optionOfDelivery) {
      throw applicationError('VALIDATION', 'Delivery option cannot be changed after reservation creation');
    }
    if (Object.keys(fieldUpdates).length > 0) {
      await Reservation.updateFields(reservationId, fieldUpdates, { tx });
      reservation = await requireReservation(reservationId, { tx });
    }
    if (status === STATUS.CONFIRMED) {
      await confirmWithinTransaction({ actor, reservation, tx });
    } else if (status === STATUS.CANCELLED) {
      await cancelWithinTransaction({ actor, reservation, tx });
    } else if (status === STATUS.PENDING && reservation.status !== STATUS.PENDING) {
      throw applicationError('CONFLICT', 'Reservation cannot return to pending');
    }
  });
  return Reservation.findById(reservationId);
}

async function deleteReservation({ actor, reservationId }) {
  return withTransaction(async (tx) => {
    const reservation = await requireLockedReservation(reservationId, tx);
    assertCanAccess(actor, reservation);
    return Reservation.deleteById(reservationId, { tx });
  });
}

async function getMyReservations({ actor, status }) {
  return Reservation.findAll({ customerId: actorId(actor), status, limit: DEFAULT_PAGE_SIZE });
}

async function getMyProductReservations({ actor, status }) {
  return Reservation.findAll({ ownerId: actorId(actor), status, limit: DEFAULT_PAGE_SIZE });
}

async function getReservationStats({ actor }) {
  return Reservation.getOwnerStats(actorId(actor));
}

async function getProductReservations({ actor, productId }) {
  const product = await ReservationStock.findProductById(productId);
  if (!product) throw applicationError('NOT_FOUND', 'Product not found');
  if (!isAdmin(actor) && product.ownerId !== actorId(actor)) {
    throw applicationError('FORBIDDEN', 'Access denied. You can only view reservations for your own products.');
  }
  const reservations = await Reservation.findAll({ productId, limit: DEFAULT_PAGE_SIZE });
  return { product, reservations };
}

module.exports = {
  listReservations,
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
