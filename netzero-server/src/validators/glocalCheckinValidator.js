const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const CHECKIN_STATUSES = Object.freeze(['not_started', 'partial', 'completed']);
const checkinIdParams = Joi.object({ id: Joi.number().integer().positive().required() });
const verifyCheckinBody = Joi.object({ email: Joi.string().email().required() });
const checkinFilters = Joi.object({
  surveyId: Joi.string().max(64),
  status: Joi.string().valid(...CHECKIN_STATUSES),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const createCheckinBody = Joi.object({
  surveyId: Joi.string().max(64).required(),
  identifierValue: Joi.string().email().required(),
  status: Joi.string().valid(...CHECKIN_STATUSES)
});
const updateCheckinBody = Joi.object({
  status: Joi.string().valid(...CHECKIN_STATUSES),
  surveymonkeyResponseId: Joi.string().max(64).allow(null)
}).min(1);
const webhookBody = Joi.object({
  event_type: Joi.string().valid('response_completed').required(),
  resources: Joi.object({
    survey_id: Joi.string().required(),
    response_id: Joi.string().required()
  }).required()
});

module.exports = {
  checkinIdParams,
  verifyCheckinBody,
  checkinFilters,
  createCheckinBody,
  updateCheckinBody,
  webhookBody
};
