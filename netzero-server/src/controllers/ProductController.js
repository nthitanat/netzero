const ProductService = require('../services/ProductService');
const { sendSuccess } = require('../middleware/response');
const config = require('../config/env');

const IMAGE_CACHE_SECONDS = config.cache.imageMaxAgeSeconds;

function generateFileUrl(req, relativePath) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${config.apiPrefix}/${config.apiVersion}/products/images/${relativePath}`;
}

function serializeProduct(product) {
  return {
    id: product.productId,
    project_id: product.projectId,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    type: product.type,
    address: product.address,
    coordinate: product.coordinate,
    stock_quantity: product.stockQuantity,
    unassigned_stock_quantity: product.unassignedStockQuantity,
    isRecommend: product.isRecommended,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    user_id: product.ownerId,
    owner: product.owner
  };
}

function mapProductInput(body) {
  const fields = {
    project_id: 'projectId',
    title: 'title',
    description: 'description',
    price: 'price',
    category: 'category',
    type: 'type',
    address: 'address',
    coordinate: 'coordinate',
    stock_quantity: 'stockQuantity',
    isRecommend: 'isRecommended'
  };
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([apiName]) => body[apiName] !== undefined)
      .map(([apiName, domainName]) => [domainName, body[apiName]])
  );
}

function mapProductFilters(query) {
  return {
    category: query.category,
    type: query.type,
    isRecommended: query.isRecommend,
    inStock: query.inStock,
    limit: query.limit,
    offset: query.offset
  };
}

async function getAllProducts(req, res) {
  const products = await ProductService.listProducts({ filters: mapProductFilters(req.validated.query) });
  return sendSuccess(res, {
    message: 'Products retrieved successfully',
    data: products.map(serializeProduct),
    count: products.length,
    filters: req.validated.query
  });
}

async function getProductById(req, res) {
  const product = await ProductService.getProductById({ productId: req.validated.params.id });
  return sendSuccess(res, { message: 'Product retrieved successfully', data: serializeProduct(product) });
}

async function createProduct(req, res) {
  const product = await ProductService.createProduct({
    actor: req.user,
    data: mapProductInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Product created successfully',
    data: serializeProduct(product),
    statusCode: 201
  });
}

async function updateProduct(req, res) {
  const product = await ProductService.updateProduct({
    actor: req.user,
    productId: req.validated.params.id,
    updates: mapProductInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Product updated successfully',
    data: serializeProduct(product)
  });
}

async function deleteProduct(req, res) {
  await ProductService.deleteProduct({ actor: req.user, productId: req.validated.params.id });
  return sendSuccess(res, { message: 'Product deleted successfully' });
}

async function getMyProducts(req, res) {
  const products = await ProductService.getMyProducts({
    actor: req.user,
    filters: req.validated.query
  });
  return sendSuccess(res, {
    message: 'User products retrieved successfully',
    data: products.map(serializeProduct),
    count: products.length
  });
}

async function searchProducts(req, res) {
  const searchTerm = req.validated.params.searchTerm;
  const products = await ProductService.searchProducts({
    searchTerm,
    filters: req.validated.query
  });
  return sendSuccess(res, {
    message: `Products matching '${searchTerm}' retrieved successfully`,
    data: products.map(serializeProduct),
    count: products.length,
    searchTerm
  });
}

async function getRecommendedProducts(req, res) {
  const products = await ProductService.getRecommendedProducts({ page: req.validated.query });
  return sendSuccess(res, {
    message: 'Recommended products retrieved successfully',
    data: products.map(serializeProduct),
    count: products.length
  });
}

async function getProductsByType(req, res) {
  const type = req.validated.params.type;
  const products = await ProductService.getProductsByType({ type, page: req.validated.query });
  return sendSuccess(res, {
    message: `Products of type '${type}' retrieved successfully`,
    data: products.map(serializeProduct),
    count: products.length,
    type
  });
}

async function sendProductImage(req, res, next, imageKind) {
  const filePath = await ProductService.getProductImagePath({
    productId: req.validated.params.id,
    imageKind,
    imageId: req.validated.params.imageId
  });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', `public, max-age=${IMAGE_CACHE_SECONDS}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendFile(filePath, error => {
    if (error && !res.headersSent) next(error);
  });
}

async function getProductThumbnail(req, res, next) {
  return sendProductImage(req, res, next, 'thumbnail');
}

async function getProductCover(req, res, next) {
  return sendProductImage(req, res, next, 'cover');
}

async function getProductImages(req, res, next) {
  return sendProductImage(req, res, next, 'images');
}

async function getAllProductImages(req, res) {
  const productId = req.validated.params.id;
  const images = await ProductService.listProductImages({ productId });
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrlBase = `${baseUrl}${config.apiPrefix}/${config.apiVersion}/products/${productId}/images`;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  return sendSuccess(res, {
    message: 'Product images metadata retrieved successfully',
    data: {
      productId,
      images: images.map(image => ({ ...image, url: `${imageUrlBase}/${image.imageId}` })),
      totalImages: images.length
    }
  });
}

async function uploadProductImage(req, res, imageKind) {
  const productId = req.validated.params.id;
  const files = imageKind === 'images' ? (req.files || []) : (req.file ? [req.file] : []);
  const uploadedFiles = await ProductService.uploadProductImages({
    actor: req.user,
    productId,
    files,
    imageKind
  });
  const responseFiles = uploadedFiles.map(file => ({
    filename: file.filename,
    path: file.relativePath,
    url: generateFileUrl(req, file.relativePath),
    size: file.size,
    mimetype: file.mimetype,
    ...(file.index !== undefined && { index: file.index })
  }));
  if (imageKind === 'images') {
    return sendSuccess(res, {
      message: 'Product images uploaded successfully',
      data: { productId, files: responseFiles, totalFiles: responseFiles.length }
    });
  }
  return sendSuccess(res, {
    message: imageKind === 'thumbnail'
      ? 'Product thumbnail uploaded successfully'
      : 'Product cover uploaded successfully',
    data: { productId, ...responseFiles[0] }
  });
}

async function uploadProductThumbnail(req, res) {
  return uploadProductImage(req, res, 'thumbnail');
}

async function uploadProductCover(req, res) {
  return uploadProductImage(req, res, 'cover');
}

async function uploadProductImages(req, res) {
  return uploadProductImage(req, res, 'images');
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  searchProducts,
  getRecommendedProducts,
  getProductsByType,
  getProductThumbnail,
  getProductCover,
  getAllProductImages,
  getProductImages,
  uploadProductThumbnail,
  uploadProductCover,
  uploadProductImages
};
