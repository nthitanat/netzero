const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const CHAT_STATUSES = Object.freeze(['active', 'closed', 'archived']);
const chatIdParams = Joi.object({ id: Joi.string().trim().min(1).max(255).required() });
const chatAppFilters = Joi.object({
  owner_id: Joi.number().integer().positive(),
  product_id: Joi.number().integer().positive(),
  status: Joi.string().valid(...CHAT_STATUSES, 'all'),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const statisticsQuery = Joi.object({ user_id: Joi.number().integer().positive() });
const pageQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const createChatAppBody = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  title: Joi.string().trim().min(3).max(255).required(),
  description: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid(...CHAT_STATUSES)
});
const updateChatAppBody = Joi.object({
  title: Joi.string().trim().min(3).max(255),
  description: Joi.string().max(1000).allow('', null),
  status: Joi.string().valid(...CHAT_STATUSES)
}).min(1);

module.exports = {
  chatIdParams,
  chatAppFilters,
  statisticsQuery,
  pageQuery,
  createChatAppBody,
  updateChatAppBody
};
