const EventProductService = require('../services/EventProductService');
const { sendSuccess } = require('../middleware/response');

function serializeEventProduct(item) {
  return {
    id: item.eventProductId,
    event_id: item.eventId,
    product_id: item.productId,
    event_price: Number(item.eventPrice),
    stock_quantity: item.stockQuantity,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt
  };
}

function serializeEventProductPatch(item) {
  return {
    ...serializeEventProduct(item),
    event_title: item.eventTitle,
    event_date: item.eventDate,
    event_location: item.eventLocation,
    product_title: item.productTitle,
    product_stock_quantity: item.productStockQuantity,
    product_unassigned_stock_quantity: item.productUnassignedStockQuantity
  };
}

function mapUpdates(body) {
  const updates = {};
  if (body.event_price !== undefined) updates.eventPrice = body.event_price;
  if (body.stock_quantity !== undefined) updates.stockQuantity = body.stock_quantity;
  if (body.status !== undefined) updates.status = body.status;
  return updates;
}

async function getAllEventProducts(req, res) {
  const query = req.validated.query;
  const items = await EventProductService.listEventProducts({
    filters: {
      eventId: query.event_id,
      productId: query.product_id,
      status: query.status,
      limit: query.limit,
      offset: query.offset
    }
  });
  return sendSuccess(res, {
    message: 'Event products retrieved successfully',
    data: items.map(serializeEventProduct),
    count: items.length
  });
}

async function getEventProductById(req, res) {
  const item = await EventProductService.getEventProductById({
    eventProductId: req.validated.params.id
  });
  return sendSuccess(res, {
    message: 'Event product retrieved successfully',
    data: serializeEventProduct(item)
  });
}

async function getEventsByProductId(req, res) {
  const { product, events } = await EventProductService.getEventsByProductId({
    productId: req.validated.params.productId
  });
  return sendSuccess(res, {
    message: 'Events for product retrieved successfully',
    data: events.map(event => ({
      event_id: event.eventId,
      event_title: event.eventTitle,
      event_date: event.eventDate,
      location: event.location,
      status: event.status,
      event_price: event.eventPrice,
      stock_quantity: event.stockQuantity,
      event_product_status: event.eventProductStatus,
      event_product_id: event.eventProductId
    })),
    count: events.length,
    product: { id: product.productId, title: product.title }
  });
}

async function getProductsByEventId(req, res) {
  const { event, products } = await EventProductService.getProductsByEventId({
    eventId: req.validated.params.eventId
  });
  return sendSuccess(res, {
    message: 'Products for event retrieved successfully',
    data: products.map(product => ({
      product_id: product.productId,
      product_title: product.productTitle,
      description: product.description,
      category: product.category,
      original_price: product.originalPrice,
      event_price: product.eventPrice,
      stock_quantity: product.stockQuantity,
      event_product_status: product.eventProductStatus,
      event_product_id: product.eventProductId
    })),
    count: products.length,
    event: { id: event.eventId, title: event.title }
  });
}

async function createEventProduct(req, res) {
  const body = req.validated.body;
  const item = await EventProductService.createEventProduct({
    actor: req.user,
    data: {
      eventId: body.event_id,
      productId: body.product_id,
      eventPrice: body.event_price,
      stockQuantity: body.stock_quantity
    }
  });
  return sendSuccess(res, {
    message: `Event product created successfully with status: ${item.status}`,
    data: serializeEventProduct(item),
    statusCode: 201
  });
}

async function updateEventProduct(req, res) {
  const item = await EventProductService.updateEventProduct({
    actor: req.user,
    eventProductId: req.validated.params.id,
    updates: mapUpdates(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Event product updated successfully',
    data: serializeEventProduct(item)
  });
}

async function patchEventProduct(req, res) {
  const item = await EventProductService.updateEventProduct({
    actor: req.user,
    eventProductId: req.validated.params.id,
    updates: mapUpdates(req.validated.body),
    requireProductOwner: true
  });
  return sendSuccess(res, {
    message: 'Event product updated successfully',
    data: serializeEventProductPatch(item)
  });
}

async function deleteEventProduct(req, res) {
  await EventProductService.deleteEventProduct({
    actor: req.user,
    eventProductId: req.validated.params.id
  });
  return sendSuccess(res, { message: 'Event product deleted successfully' });
}

module.exports = {
  getAllEventProducts,
  getEventProductById,
  getEventsByProductId,
  getProductsByEventId,
  createEventProduct,
  updateEventProduct,
  patchEventProduct,
  deleteEventProduct
};
