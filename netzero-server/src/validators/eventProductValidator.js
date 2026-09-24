const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const EVENT_PRODUCT_STATUSES = Object.freeze(['pending', 'confirmed']);
const positiveId = Joi.number().integer().positive();
const nonNegativeQuantity = Joi.number().integer().min(0);
const nonNegativePrice = Joi.number().min(0);

const eventProductIdParams = Joi.object({ id: positiveId.required() });
const productIdParams = Joi.object({ productId: positiveId.required() });
const eventIdParams = Joi.object({ eventId: positiveId.required() });
const eventProductFilters = Joi.object({
  event_id: positiveId,
  product_id: positiveId,
  status: Joi.string().valid(...EVENT_PRODUCT_STATUSES),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const createEventProductBody = Joi.object({
  event_id: positiveId.required(),
  product_id: positiveId.required(),
  event_price: nonNegativePrice.required(),
  stock_quantity: nonNegativeQuantity.default(0)
});
const updateEventProductBody = Joi.object({
  event_price: nonNegativePrice,
  stock_quantity: nonNegativeQuantity,
  status: Joi.string().valid(...EVENT_PRODUCT_STATUSES)
}).min(1);
const patchEventProductBody = Joi.object({
  event_price: nonNegativePrice,
  stock_quantity: nonNegativeQuantity
}).min(1);

module.exports = {
  eventProductIdParams,
  productIdParams,
  eventIdParams,
  eventProductFilters,
  createEventProductBody,
  updateEventProductBody,
  patchEventProductBody
};
