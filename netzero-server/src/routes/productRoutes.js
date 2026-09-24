const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validateRequest');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/imageUpload');
const {
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
} = require('../validators/productValidator');

const router = express.Router();

function imageOptions(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  return res.sendStatus(200);
}

router.get('/', validateRequest({ query: productFilters }), asyncHandler(ProductController.getAllProducts));
router.get('/type/:type', validateRequest({ params: productTypeParams, query: pageQuery }), asyncHandler(ProductController.getProductsByType));
router.get('/recommended', validateRequest({ query: pageQuery }), asyncHandler(ProductController.getRecommendedProducts));
router.get('/search/:searchTerm', validateRequest({ params: productSearchParams, query: searchFilters }), asyncHandler(ProductController.searchProducts));
router.get('/my', authenticateToken, validateRequest({ query: myProductFilters }), asyncHandler(ProductController.getMyProducts));
router.get('/:id/thumbnail', validateRequest({ params: productIdParams }), asyncHandler(ProductController.getProductThumbnail));
router.options('/:id/thumbnail', imageOptions);
router.get('/:id/cover', validateRequest({ params: productIdParams }), asyncHandler(ProductController.getProductCover));
router.options('/:id/cover', imageOptions);
router.get('/:id/images/:imageId', validateRequest({ params: productImageParams }), asyncHandler(ProductController.getProductImages));
router.options('/:id/images/:imageId', imageOptions);
router.get('/:id/images', validateRequest({ params: productIdParams }), asyncHandler(ProductController.getAllProductImages));
router.options('/:id/images', imageOptions);
router.get('/:id', validateRequest({ params: productIdParams }), asyncHandler(ProductController.getProductById));
router.post('/', authenticateToken, validateRequest({ body: createProductBody }), asyncHandler(ProductController.createProduct));
router.put('/:id', authenticateToken, validateRequest({ params: productIdParams, body: updateProductBody }), asyncHandler(ProductController.updateProduct));
router.delete('/:id', authenticateToken, validateRequest({ params: productIdParams }), asyncHandler(ProductController.deleteProduct));
router.post('/:id/upload/thumbnail', authenticateToken, validateRequest({ params: productIdParams }), uploadSingle('thumbnail'), handleUploadError, asyncHandler(ProductController.uploadProductThumbnail));
router.post('/:id/upload/cover', authenticateToken, validateRequest({ params: productIdParams }), uploadSingle('cover'), handleUploadError, asyncHandler(ProductController.uploadProductCover));
router.post('/:id/upload/images', authenticateToken, validateRequest({ params: productIdParams }), uploadMultiple('images', 10), handleUploadError, asyncHandler(ProductController.uploadProductImages));

module.exports = router;
