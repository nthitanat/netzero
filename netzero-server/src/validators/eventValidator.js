const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const EVENT_STATUSES = Object.freeze(['active', 'cancelled', 'completed']);
const eventIdParams = Joi.object({ id: Joi.number().integer().positive().required() });
const categoryParams = Joi.object({ category: Joi.string().trim().min(1).required() });
const eventNameParams = Joi.object({ name: Joi.string().trim().min(1).required() });
const eventPageQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const eventFields = {
  title: Joi.string().trim().min(1).max(255),
  description: Joi.string().allow('', null),
  event_date: Joi.date(),
  location: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  organizer: Joi.string().allow('', null),
  contact_email: Joi.string().email().allow('', null),
  contact_phone: Joi.string().allow('', null),
  max_participants: Joi.number().integer().min(0),
  registration_deadline: Joi.date().allow(null),
  status: Joi.string().valid(...EVENT_STATUSES)
};
const createEventBody = Joi.object({
  ...eventFields,
  title: eventFields.title.required(),
  event_date: eventFields.event_date.required(),
  isRecommended: Joi.boolean()
});
const updateEventBody = Joi.object(eventFields).min(1);

module.exports = {
  eventIdParams,
  categoryParams,
  eventNameParams,
  eventPageQuery,
  createEventBody,
  updateEventBody
};
