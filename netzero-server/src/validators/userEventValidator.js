const Joi = require('joi');

const positiveId = Joi.number().integer().positive();
const userIdParams = Joi.object({ userId: positiveId.required() });
const eventIdParams = Joi.object({ eventId: positiveId.required() });
const userEventParams = Joi.object({
  userId: positiveId.required(),
  eventId: positiveId.required()
});
const joinEventBody = Joi.object({
  userId: positiveId.required(),
  eventId: positiveId.required()
});

module.exports = { userIdParams, eventIdParams, userEventParams, joinEventBody };
