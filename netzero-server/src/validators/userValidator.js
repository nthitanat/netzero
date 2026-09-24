const Joi = require('joi');
const config = require('../config/env');

const userIdParams = Joi.object({ id: Joi.number().integer().positive().required() });
const userListQuery = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(config.pagination.maxPageSize)
});
const updateUserBody = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  profileImage: Joi.string().uri().allow('', null),
  phoneNumber: Joi.string().allow('', null),
  address: Joi.string().max(500).allow('', null)
});
const updatePasswordBody = Joi.object({
  currentPassword: Joi.string(),
  newPassword: Joi.string().min(6).max(100).required()
});

module.exports = {
  userIdParams,
  userListQuery,
  updateUserBody,
  updatePasswordBody
};
