const config = require('../config/env');
const Product = require('../models/Product');
const imageStorage = require('../adapters/productImageStorage');
const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function pageOptions({ limit, offset } = {}) {
  return {
    limit: Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: offset ?? 0
  };
}

async function requireProduct(productId, context) {
  const product = await Product.findById(productId, context);
  if (!product) throw applicationError('NOT_FOUND', 'Product not found');
  return product;
}

function assertCanEdit(actor, product) {
  if (actor.role !== 'admin' && product.ownerId !== actorId(actor)) {
    throw applicationError('FORBIDDEN', 'Product not found or access denied');
  }
}

async function listProducts({ filters = {} }) {
  return Product.findAll({ ...filters, ...pageOptions(filters) });
}

async function getProductById({ productId }) {
  return requireProduct(productId);
}

async function createProduct({ actor, data }) {
  const productId = await Product.insert({ ...data, ownerId: actorId(actor) });
  return Product.findById(productId);
}

async function updateProduct({ actor, productId, updates }) {
  await withTransaction(async (tx) => {
    if (!await Product.lockById(productId, { tx })) {
      throw applicationError('NOT_FOUND', 'Product not found');
    }
    const current = await requireProduct(productId, { tx });
    assertCanEdit(actor, current);
    const nextUpdates = { ...updates };
    if (updates.stockQuantity !== undefined) {
      const assignedQuantity = current.stockQuantity - current.unassignedStockQuantity;
      const unassignedStockQuantity = updates.stockQuantity - assignedQuantity;
      if (unassignedStockQuantity < 0) {
        throw applicationError('CONFLICT', 'Stock quantity cannot be lower than assigned stock');
      }
      nextUpdates.unassignedStockQuantity = unassignedStockQuantity;
    }
    await Product.updateById({ productId, ownerId: current.ownerId, updates: nextUpdates }, { tx });
  });
  return Product.findById(productId);
}

async function deleteProduct({ actor, productId }) {
  const product = await requireProduct(productId);
  assertCanEdit(actor, product);
  const didDelete = await Product.deleteById({ productId, ownerId: product.ownerId });
  if (!didDelete) throw applicationError('NOT_FOUND', 'Product not found or access denied');
}

async function getMyProducts({ actor, filters = {} }) {
  return Product.findAll({ ...filters, ownerId: actorId(actor), ...pageOptions(filters) });
}

async function searchProducts({ searchTerm, filters = {} }) {
  return Product.findAll({ ...filters, searchTerm, ...pageOptions(filters) });
}

async function getRecommendedProducts({ page }) {
  return Product.findAll({ isRecommended: true, ...pageOptions(page) });
}

async function getProductsByType({ type, page }) {
  return Product.findAll({ type, ...pageOptions(page) });
}

async function getProductImagePath({ productId, imageKind, imageId }) {
  const filePath = await imageStorage.findImage({ productId, imageKind, imageId });
  if (!filePath) throw applicationError('NOT_FOUND', 'Product image file not found');
  return filePath;
}

async function listProductImages({ productId }) {
  await requireProduct(productId);
  return imageStorage.listImages(productId);
}

async function uploadProductImages({ actor, productId, files, imageKind }) {
  const uploadedFiles = [];
  try {
    const product = await requireProduct(productId);
    assertCanEdit(actor, product);
    if (!files.length) {
      throw applicationError('VALIDATION', imageKind === 'images' ? 'No files uploaded' : 'No file uploaded');
    }
    const existingImages = imageKind === 'images' ? await imageStorage.listImages(productId) : [];
    let nextImageId = existingImages.reduce((largestId, image) => Math.max(largestId, image.imageId), 0) + 1;
    for (const file of files) {
      const uploadedFile = await imageStorage.commitUpload({
        file,
        productId,
        imageKind,
        ...(imageKind === 'images' && { imageId: nextImageId })
      });
      uploadedFiles.push(uploadedFile);
      if (imageKind === 'images') nextImageId = uploadedFile.index + 1;
    }
    return uploadedFiles;
  } catch (error) {
    await Promise.all(uploadedFiles.filter(file => file.index !== undefined).map(file =>
      imageStorage.discardCommittedImage({ productId, imageId: file.index })
    )).catch(cleanupError => {
      console.error('Failed to remove committed product images:', cleanupError);
    });
    await imageStorage.discardUploads(files).catch(cleanupError => {
      console.error('Failed to remove staged product images:', cleanupError);
    });
    throw error;
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  searchProducts,
  getRecommendedProducts,
  getProductsByType,
  getProductImagePath,
  listProductImages,
  uploadProductImages
};
