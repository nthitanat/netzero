const Joi = require('joi');
const config = require('../config/env');

const surveyIdParams = Joi.object({ id: Joi.number().integer().positive().required() });
const listSurveyQuery = Joi.object({
  active: Joi.boolean(),
  upcoming: Joi.boolean(),
  past: Joi.boolean(),
  limit: Joi.number().integer().positive().max(config.survey.maxPageSize),
  offset: Joi.number().integer().min(0)
}).with('offset', 'limit');
const responseQuery = Joi.object({
  limit: Joi.number().integer().positive().max(config.survey.maxPageSize),
  offset: Joi.number().integer().min(0),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
}).with('offset', 'limit');
const questionBody = Joi.object({
  question_text: Joi.string().trim().min(1).required(),
  question_type: Joi.string().valid('text', 'multiple_choice', 'yes_no', 'rating', 'checkbox').default('text'),
  order_in_survey: Joi.number().integer().positive().allow(null).default(null)
});
const createSurveyBody = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().allow('', null),
  start_date: Joi.date().iso().allow(null),
  end_date: Joi.date().iso().allow(null),
  questions: Joi.array().items(questionBody).default([])
});
const updateSurveyBody = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().allow('', null),
  start_date: Joi.date().iso().allow(null),
  end_date: Joi.date().iso().allow(null)
}).min(1);
const submitSurveyBody = Joi.object({
  respondent_id: Joi.alternatives().try(
    Joi.string().trim().max(255).allow('', null),
    Joi.number().integer().positive()
  ),
  answers: Joi.array().min(1).items(Joi.object({
    question_id: Joi.number().integer().positive().required(),
    answer_text: Joi.string().allow('', null),
    answer_choice_id: Joi.number().integer().positive().allow(null)
  })).required()
});

module.exports = {
  surveyIdParams,
  listSurveyQuery,
  responseQuery,
  questionBody,
  createSurveyBody,
  updateSurveyBody,
  submitSurveyBody
};
