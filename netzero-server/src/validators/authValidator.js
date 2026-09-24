const Joi = require('joi');

const password = Joi.string().min(6).max(100);
const registerBody = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: password.required(),
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  phoneNumber: Joi.string().allow('', null),
  address: Joi.string().max(500).allow('', null)
});
const loginBody = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required()
});

module.exports = { registerBody, loginBody };
