const Joi = require('joi');
const config = require('../config/env');

const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const PRODUCT_TYPES = Object.freeze(['market', 'willing', 'barter']);
const productIdParams = Joi.object({ id: Joi.number().integer().positive().required() });
const productImageParams = Joi.object({
  id: Joi.number().integer().positive().required(),
  imageId: Joi.number().integer().positive().required()
});
const productTypeParams = Joi.object({ type: Joi.string().valid(...PRODUCT_TYPES).required() });
const productSearchParams = Joi.object({ searchTerm: Joi.string().trim().min(1).required() });
const productFilters = Joi.object({
  category: Joi.string(),
  type: Joi.string().valid(...PRODUCT_TYPES),
  isRecommend: Joi.boolean(),
  inStock: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const myProductFilters = Joi.object({
  category: Joi.string(),
  type: Joi.string().valid(...PRODUCT_TYPES),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const searchFilters = Joi.object({
  category: Joi.string(),
  type: Joi.string().valid(...PRODUCT_TYPES),
  inStock: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const pageQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE),
  offset: Joi.number().integer().min(0)
});
const productFields = {
  project_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().trim().min(1).max(255),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0),
  category: Joi.string().trim().min(1),
  type: Joi.string().valid(...PRODUCT_TYPES),
  address: Joi.string().allow('', null),
  coordinate: Joi.string().allow('', null),
  stock_quantity: Joi.number().integer().min(0),
  isRecommend: Joi.boolean()
};
const createProductBody = Joi.object({
  ...productFields,
  title: productFields.title.required(),
  description: productFields.description.required(),
  price: Joi.number().positive().required(),
  category: productFields.category.required(),
  type: productFields.type.required()
});
const updateProductBody = Joi.object(productFields).min(1);

module.exports = {
  productIdParams,
  productImageParams,
  productTypeParams,
  productSearchParams,
  productFilters,
  myProductFilters,
  searchFilters,
  pageQuery,
  createProductBody,
  updateProductBody
};
