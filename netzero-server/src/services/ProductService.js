const config = require('../config/env');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
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
  return attachImages(await Product.findAll({ ...filters, ...pageOptions(filters) }));
}

async function getProductById({ productId }) {
  return attachOne(await requireProduct(productId));
}

async function attachImages(products) {
  if (!products.length) return products;
  const rows = await ProductImage.findForProducts(products.map(product => product.productId));
  const byProduct = new Map();
  for (const row of rows) {
    if (!byProduct.has(row.productId)) byProduct.set(row.productId, []);
    byProduct.get(row.productId).push(row);
  }
  return products.map(product => ({ ...product, images: byProduct.get(product.productId) || [] }));
}

async function attachOne(product) {
  return (await attachImages([product]))[0];
}

async function createProduct({ actor, data }) {
  const productId = await Product.insert({ ...data, ownerId: actorId(actor) });
  return attachOne(await Product.findById(productId));
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
  return attachOne(await Product.findById(productId));
}

async function deleteProduct({ actor, productId }) {
  const product = await requireProduct(productId);
  assertCanEdit(actor, product);
  const didDelete = await Product.deleteById({ productId, ownerId: product.ownerId });
  if (!didDelete) throw applicationError('NOT_FOUND', 'Product not found or access denied');
}

async function getMyProducts({ actor, filters = {} }) {
  return attachImages(await Product.findAll({ ...filters, ownerId: actorId(actor), ...pageOptions(filters) }));
}

async function searchProducts({ searchTerm, filters = {} }) {
  return attachImages(await Product.findAll({ ...filters, searchTerm, ...pageOptions(filters) }));
}

async function getRecommendedProducts({ page }) {
  return attachImages(await Product.findAll({ isRecommended: true, ...pageOptions(page) }));
}

async function getProductsByType({ type, page }) {
  return attachImages(await Product.findAll({ type, ...pageOptions(page) }));
}

async function getProductImagePath({ productId, imageKind, imageId }) {
  const role = imageKind === 'images' ? 'gallery' : imageKind;
  const image = await ProductImage.findOne({ productId, role, imageId });
  if (image) return { filePath: imageStorage.resolveStoragePath(image.relativePath),
    mimetype: image.mimetype, version: image.version };
  if (!config.imageMetadataReadsEnabled) {
    const legacy = await imageStorage.findImage({ productId, imageKind, imageId });
    if (legacy) return legacy;
  }
  throw applicationError('NOT_FOUND', 'Product image file not found');
}

async function listProductImages({ productId }) {
  await requireProduct(productId);
  const images = await ProductImage.listGallery(productId);
  const responseImages = images.map(image => ({
    imageId: image.imageId,
    filename: image.relativePath.split('/').at(-1),
    size: image.size,
    exists: true,
    lastModified: image.lastModified,
    displayPosition: image.displayPosition
  }));
  if (!config.imageMetadataReadsEnabled) {
    const legacy = await imageStorage.listImages(productId);
    const indexed = new Set(responseImages.map(image => image.imageId));
    responseImages.push(...legacy.filter(image => !indexed.has(image.imageId)));
    responseImages.sort((left, right) => (left.displayPosition ?? left.imageId) -
      (right.displayPosition ?? right.imageId));
  }
  return responseImages;
}

async function uploadProductImages({ actor, productId, files, imageKind }) {
  const uploadedFiles = [];
  let oldPath = null;
  try {
    if (!config.imageMetadataUploadsEnabled) {
      throw applicationError('EXTERNAL', 'Product image uploads are paused for image metadata migration');
    }
    const product = await requireProduct(productId);
    assertCanEdit(actor, product);
    if (!files.length) {
      throw applicationError('VALIDATION', imageKind === 'images' ? 'No files uploaded' : 'No file uploaded');
    }
    const imageIds = imageKind === 'images'
      ? await withTransaction(async tx => ProductImage.reserveGalleryNumbers(productId, files.length, { tx }))
      : [];
    if (imageKind === 'images' && !imageIds) throw applicationError('NOT_FOUND', 'Product not found');
    for (const [position, file] of files.entries()) {
      const uploadedFile = await imageStorage.commitUpload({
        file,
        productId,
        imageKind,
        ...(imageKind === 'images' && { imageId: imageIds[position] })
      });
      uploadedFiles.push(uploadedFile);
    }
    await withTransaction(async tx => {
      // Serialize replacements for one product, including concurrent fixed-role uploads.
      if (!await Product.lockById(productId, { tx })) throw applicationError('NOT_FOUND', 'Product not found');
      if (imageKind === 'images') {
        await ProductImage.insertGallery(uploadedFiles.map(file => ({
          productId, imageId: file.index, displayPosition: file.index,
          relativePath: file.storagePath, mimetype: file.mimetype, size: file.size,
          fileModifiedMs: file.fileModifiedMs
        })), { tx });
      } else {
        const file = uploadedFiles[0];
        oldPath = await ProductImage.replaceFixed({ productId, role: imageKind,
          relativePath: file.storagePath, mimetype: file.mimetype, size: file.size,
          fileModifiedMs: file.fileModifiedMs }, { tx });
      }
    });
    if (oldPath) await imageStorage.discardStoredImage(oldPath).catch(error => {
      console.error('Failed to remove replaced product image:', error);
    });
    return uploadedFiles;
  } catch (error) {
    await Promise.all(uploadedFiles.map(file =>
      imageStorage.discardStoredImage(file.storagePath)
    )).catch(cleanupError => {
      console.error('Failed to remove committed product images:', cleanupError);
    });
    await imageStorage.discardUploads(files).catch(cleanupError => {
      console.error('Failed to remove staged product images:', cleanupError);
    });
    if (error.code === 'INVALID_IMAGE') {
      throw applicationError('VALIDATION', error.message);
    }
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
