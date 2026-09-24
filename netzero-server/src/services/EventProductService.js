const config = require('../config/env');
const EventProduct = require('../models/EventProduct');
const ReservationStock = require('../models/ReservationStock');
const UserEvent = require('../models/UserEvent');
const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const EVENT_PRODUCT_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed'
});

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function isAdmin(actor) {
  return actor.role === 'admin';
}

async function requireEventProduct(eventProductId, context) {
  const eventProduct = await EventProduct.findById(eventProductId, context);
  if (!eventProduct) throw applicationError('NOT_FOUND', 'Event product not found');
  return eventProduct;
}

async function requireProduct(productId, context) {
  const product = await ReservationStock.findProductById(productId, context);
  if (!product) throw applicationError('NOT_FOUND', 'Product not found');
  return product;
}

async function listEventProducts({ filters = {} }) {
  return EventProduct.findAll({
    ...filters,
    limit: Math.min(filters.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: filters.offset ?? 0
  });
}

async function getEventProductById({ eventProductId }) {
  return requireEventProduct(eventProductId);
}

async function getEventsByProductId({ productId }) {
  const product = await requireProduct(productId);
  const events = await EventProduct.getEventsByProductId(productId);
  return { product: { productId: product.productId, title: product.title }, events };
}

async function getProductsByEventId({ eventId }) {
  const event = await EventProduct.findEventById(eventId);
  if (!event) throw applicationError('NOT_FOUND', 'Event not found');
  const products = await EventProduct.getProductsByEventId(eventId);
  return { event, products };
}

async function createEventProduct({ actor, data }) {
  const eventProductId = await withTransaction(async (tx) => {
    const event = await EventProduct.findEventById(data.eventId, { tx });
    if (!event) throw applicationError('NOT_FOUND', 'Event not found');
    const product = await requireProduct(data.productId, { tx });
    const doesOwnProduct = product.ownerId === actorId(actor);
    if (!doesOwnProduct && !isAdmin(actor)) {
      throw applicationError('FORBIDDEN', 'Only the product owner or admin can add this product to an event');
    }
    const existing = await EventProduct.findByEventAndProduct({
      eventId: data.eventId,
      productId: data.productId
    }, { tx });
    if (existing) throw applicationError('CONFLICT', 'This product is already assigned to this event');
    const hasEventAccess = isAdmin(actor) || await UserEvent.hasAssociation({
      userId: actorId(actor),
      eventId: data.eventId
    }, { tx });
    const stockQuantity = data.stockQuantity ?? 0;
    if (stockQuantity > 0) {
      const didAssignStock = await EventProduct.adjustUnassignedStock({
        productId: data.productId,
        quantityChange: -stockQuantity
      }, { tx });
      if (!didAssignStock) {
        throw applicationError('CONFLICT', `Insufficient unassigned stock. Available: ${product.unassignedStockQuantity ?? 0}, Requested: ${stockQuantity}`);
      }
    }
    return EventProduct.insert({
      ...data,
      stockQuantity,
      status: hasEventAccess ? EVENT_PRODUCT_STATUS.CONFIRMED : EVENT_PRODUCT_STATUS.PENDING
    }, { tx });
  }).catch(error => {
    if (error.code === 'ER_DUP_ENTRY') {
      throw applicationError('CONFLICT', 'This product is already assigned to this event', { cause: error });
    }
    throw error;
  });
  return EventProduct.findById(eventProductId);
}

async function updateEventProduct({ actor, eventProductId, updates, requireProductOwner = false }) {
  await withTransaction(async (tx) => {
    if (!await EventProduct.lockById(eventProductId, { tx })) {
      throw applicationError('NOT_FOUND', 'Event product not found');
    }
    const existing = await requireEventProduct(eventProductId, { tx });
    const product = await requireProduct(existing.productId, { tx });
    const canChangeProduct = isAdmin(actor) || product.ownerId === actorId(actor);
    const canChangeStatus = isAdmin(actor) || await UserEvent.hasAssociation({
      userId: actorId(actor),
      eventId: existing.eventId
    }, { tx });
    if (requireProductOwner && !canChangeProduct) {
      throw applicationError('FORBIDDEN', 'Only the product owner can update event products');
    }
    if ((updates.eventPrice !== undefined || updates.stockQuantity !== undefined) && !canChangeProduct) {
      throw applicationError('FORBIDDEN', 'Only the product owner can update event products');
    }
    if (updates.status !== undefined && !canChangeStatus) {
      throw applicationError('FORBIDDEN', 'Only event owners can confirm event products');
    }
    if (!canChangeProduct && !canChangeStatus) {
      throw applicationError('FORBIDDEN', 'Access denied');
    }
    const stockQuantity = updates.stockQuantity ?? existing.stockQuantity;
    const stockDifference = stockQuantity - existing.stockQuantity;
    if (stockDifference !== 0) {
      const didAdjustStock = await EventProduct.adjustUnassignedStock({
        productId: existing.productId,
        quantityChange: -stockDifference
      }, { tx });
      if (!didAdjustStock) {
        throw applicationError('CONFLICT', `Insufficient unassigned stock. Available: ${product.unassignedStockQuantity ?? 0}, Additional needed: ${stockDifference}`);
      }
    }
    await EventProduct.updateById(eventProductId, {
      eventPrice: updates.eventPrice ?? existing.eventPrice,
      stockQuantity,
      status: updates.status ?? existing.status
    }, { tx });
  });
  return EventProduct.findById(eventProductId);
}

async function deleteEventProduct({ actor, eventProductId }) {
  return withTransaction(async (tx) => {
    if (!await EventProduct.lockById(eventProductId, { tx })) {
      throw applicationError('NOT_FOUND', 'Event product not found');
    }
    const existing = await requireEventProduct(eventProductId, { tx });
    const product = await requireProduct(existing.productId, { tx });
    const hasEventAccess = await UserEvent.hasAssociation({
      userId: actorId(actor),
      eventId: existing.eventId
    }, { tx });
    if (!isAdmin(actor) && product.ownerId !== actorId(actor) && !hasEventAccess) {
      throw applicationError('FORBIDDEN', 'Access denied');
    }
    const pendingCount = await EventProduct.countPendingReservations({
      eventId: existing.eventId,
      productId: existing.productId
    }, { tx });
    if (pendingCount > 0) {
      throw applicationError('CONFLICT', 'Event product has pending reservations');
    }
    if (existing.stockQuantity > 0) {
      await EventProduct.adjustUnassignedStock({
        productId: existing.productId,
        quantityChange: existing.stockQuantity
      }, { tx });
    }
    return EventProduct.deleteById(eventProductId, { tx });
  });
}

module.exports = {
  listEventProducts,
  getEventProductById,
  getEventsByProductId,
  getProductsByEventId,
  createEventProduct,
  updateEventProduct,
  deleteEventProduct
};
