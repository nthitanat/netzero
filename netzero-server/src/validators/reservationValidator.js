const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const DELIVERY_OPTIONS = Object.freeze(['pickup', 'delivery', 'event']);
const RESERVATION_STATUSES = Object.freeze(['pending', 'confirmed', 'cancelled']);

const positiveId = Joi.number().integer().positive();
const reservationIdParams = Joi.object({ id: positiveId.required() });
const productIdParams = Joi.object({ productId: positiveId.required() });
const reservationFilters = Joi.object({
  user_id: positiveId,
  product_id: positiveId,
  product_owner_id: positiveId,
  status: Joi.string().valid(...RESERVATION_STATUSES),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const statusFilter = Joi.object({ status: Joi.string().valid(...RESERVATION_STATUSES) });
const createReservationBody = Joi.object({
  product_id: positiveId.required(),
  event_id: positiveId.allow(null),
  quantity: Joi.number().integer().positive().required(),
  reserved_unit_price: Joi.number().positive().required(),
  note: Joi.string().allow('', null),
  shipping_address: Joi.string().allow('', null),
  option_of_delivery: Joi.string().valid(...DELIVERY_OPTIONS).default('delivery'),
  user_note: Joi.string().allow('', null),
  pickup_date: Joi.date().allow(null)
}).custom((value, helpers) => {
  if (value.option_of_delivery === 'pickup' && !value.pickup_date) {
    return helpers.message('pickup_date is required when option_of_delivery is "pickup"');
  }
  if (value.option_of_delivery === 'event' && !value.event_id) {
    return helpers.message('event_id is required when option_of_delivery is "event"');
  }
  return value;
});
const updateReservationBody = Joi.object({
  quantity: Joi.number().integer().positive(),
  note: Joi.string().allow('', null),
  shipping_address: Joi.string().allow('', null),
  option_of_delivery: Joi.string().valid(...DELIVERY_OPTIONS),
  user_note: Joi.string().allow('', null),
  seller_note: Joi.string().allow('', null),
  pickup_date: Joi.date().allow(null),
  status: Joi.string().valid(...RESERVATION_STATUSES)
}).min(1);
const updateStatusBody = Joi.object({ status: Joi.string().valid(...RESERVATION_STATUSES).required() });

module.exports = {
  reservationIdParams,
  productIdParams,
  reservationFilters,
  statusFilter,
  createReservationBody,
  updateReservationBody,
  updateStatusBody,
  DELIVERY_OPTIONS,
  RESERVATION_STATUSES
};
