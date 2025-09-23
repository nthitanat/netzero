const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/imageUpload');

// Public routes (no authentication required)

// GET /api/v1/products - Get all products with optional filters
router.get('/', ProductController.getAllProducts);

// GET /api/v1/products/type/:type - Get products by type (market, willing, barter)
router.get('/type/:type', ProductController.getProductsByType);

// GET /api/v1/products/recommended - Get recommended products
router.get('/recommended', ProductController.getRecommendedProducts);

// GET /api/v1/products/search/:searchTerm - Search products
router.get('/search/:searchTerm', ProductController.searchProducts);

// GET /api/v1/products/my - Get current user's products (must be before /:id route)
router.get('/my', authenticateToken, ProductController.getMyProducts);

// GET /api/v1/products/:id - Get product by ID (must be after specific routes)
router.get('/:id', ProductController.getProductById);

// Image retrieval routes (public)
// GET /api/v1/products/:id/thumbnail - Get product thumbnail image
router.get('/:id/thumbnail', ProductController.getProductThumbnail);
router.options('/:id/thumbnail', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.sendStatus(200);
});

// GET /api/v1/products/:id/cover - Get product cover image
router.get('/:id/cover', ProductController.getProductCover);
router.options('/:id/cover', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.sendStatus(200);
});

// GET /api/v1/products/:id/images/:imageId - Get product images
router.get('/:id/images/:imageId', ProductController.getProductImages);
router.options('/:id/images/:imageId', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.sendStatus(200);
});

// Protected routes (authentication required)

// POST /api/v1/products - Create a new product
router.post('/', authenticateToken, ProductController.createProduct);

// PUT /api/v1/products/:id - Update product (only by owner or admin)
router.put('/:id', authenticateToken, ProductController.updateProduct);

// DELETE /api/v1/products/:id - Delete product (only by owner or admin)
router.delete('/:id', authenticateToken, ProductController.deleteProduct);

// Image upload routes (protected)
// POST /api/v1/products/:id/upload/thumbnail - Upload product thumbnail
router.post('/:id/upload/thumbnail', authenticateToken, uploadSingle('thumbnail'), handleUploadError, ProductController.uploadProductThumbnail);

// POST /api/v1/products/:id/upload/cover - Upload product cover image
router.post('/:id/upload/cover', authenticateToken, uploadSingle('cover'), handleUploadError, ProductController.uploadProductCover);

// POST /api/v1/products/:id/upload/images - Upload product images
router.post('/:id/upload/images', authenticateToken, uploadMultiple('images', 10), handleUploadError, ProductController.uploadProductImages);

module.exports = router;