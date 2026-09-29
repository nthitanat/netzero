jest.mock('../models/Product', () => ({
  findById: jest.fn(), findAll: jest.fn(), insert: jest.fn(), lockById: jest.fn(),
  updateById: jest.fn(), deleteById: jest.fn()
}));
jest.mock('../models/ProductImage', () => ({
  findForProducts: jest.fn(), findOne: jest.fn(), listGallery: jest.fn(),
  reserveGalleryNumbers: jest.fn(), insertGallery: jest.fn(), replaceFixed: jest.fn()
}));
jest.mock('../adapters/productImageStorage', () => ({
  commitUpload: jest.fn(), discardUploads: jest.fn(), discardStoredImage: jest.fn(),
  resolveStoragePath: jest.fn()
}));
jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));

const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const imageStorage = require('../adapters/productImageStorage');
const config = require('../config/env');
const { withTransaction } = require('../config/database');
const Service = require('./ProductService');

const actor = { userId: 7, role: 'user' };
const product = {
  productId: 2, ownerId: 7, stockQuantity: 10, unassignedStockQuantity: 6
};
const tx = { execute: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  config.imageMetadataUploadsEnabled = true;
  withTransaction.mockImplementation(operation => operation(tx));
  Product.lockById.mockResolvedValue(true);
  Product.findById.mockResolvedValue(product);
  Product.updateById.mockResolvedValue(true);
  imageStorage.discardUploads.mockResolvedValue();
  imageStorage.discardStoredImage.mockResolvedValue();
  ProductImage.findForProducts.mockResolvedValue([]);
  ProductImage.reserveGalleryNumbers.mockResolvedValue([3, 4]);
});

test('migration pause rejects uploads and removes staged files', async () => {
  config.imageMetadataUploadsEnabled = false;
  const files = [{ path: '/tmp/staged.png' }];
  await expect(Service.uploadProductImages({ actor, productId: 2, files,
    imageKind: 'thumbnail' })).rejects.toMatchObject({ code: 'EXTERNAL', statusCode: 503 });
  expect(imageStorage.discardUploads).toHaveBeenCalledWith(files);
  expect(imageStorage.commitUpload).not.toHaveBeenCalled();
});

test('stock update preserves units assigned to events', async () => {
  await Service.updateProduct({ actor, productId: 2, updates: { stockQuantity: 8 } });
  expect(Product.updateById).toHaveBeenCalledWith({
    productId: 2,
    ownerId: 7,
    updates: { stockQuantity: 8, unassignedStockQuantity: 4 }
  }, { tx });
});

test('stock cannot be reduced below assigned units', async () => {
  await expect(Service.updateProduct({
    actor, productId: 2, updates: { stockQuantity: 3 }
  })).rejects.toMatchObject({ code: 'CONFLICT' });
  expect(Product.updateById).not.toHaveBeenCalled();
});

test('upload by non-owner discards staged file', async () => {
  const files = [{ path: '/tmp/staged.png' }];
  await expect(Service.uploadProductImages({
    actor: { userId: 8, role: 'user' }, productId: 2, files,
    imageKind: 'thumbnail'
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(imageStorage.discardUploads).toHaveBeenCalledWith(files);
  expect(imageStorage.commitUpload).not.toHaveBeenCalled();
});

test('partial image upload failure removes newly committed images', async () => {
  const files = [{ path: '/tmp/first.png' }, { path: '/tmp/second.png' }];
  imageStorage.commitUpload
    .mockResolvedValueOnce({ index: 3, storagePath: 'products/images/2/new.jpg' })
    .mockRejectedValueOnce(new Error('disk full'));
  await expect(Service.uploadProductImages({
    actor, productId: 2, files, imageKind: 'images'
  })).rejects.toThrow('disk full');
  expect(imageStorage.discardStoredImage).toHaveBeenCalledWith('products/images/2/new.jpg');
  expect(imageStorage.discardUploads).toHaveBeenCalledWith(files);
});

test('list fetches all image rows in one batch', async () => {
  Product.findAll.mockResolvedValue([{ productId: 2 }, { productId: 3 }]);
  ProductImage.findForProducts.mockResolvedValue([{ productId: 2, role: 'thumbnail' }]);
  const products = await Service.listProducts({ filters: {} });
  expect(ProductImage.findForProducts).toHaveBeenCalledTimes(1);
  expect(ProductImage.findForProducts).toHaveBeenCalledWith([2, 3]);
  expect(products.map(item => item.images.length)).toEqual([1, 0]);
});

test('fixed replacement publishes metadata then removes the old file', async () => {
  const file = { path: '/tmp/new.jpg' };
  imageStorage.commitUpload.mockResolvedValue({ storagePath: 'products/thumbnail/2/new.jpg', size: 8,
    mimetype: 'image/jpeg' });
  ProductImage.replaceFixed.mockResolvedValue('products/thumbnail/2/old.png');
  await Service.uploadProductImages({ actor, productId: 2, files: [file], imageKind: 'thumbnail' });
  expect(ProductImage.replaceFixed).toHaveBeenCalledWith(expect.objectContaining({
    relativePath: 'products/thumbnail/2/new.jpg'
  }), { tx });
  expect(imageStorage.discardStoredImage).toHaveBeenCalledWith('products/thumbnail/2/old.png');
});

test('database failure removes a newly written replacement, leaving old file', async () => {
  const file = { path: '/tmp/new.jpg' };
  imageStorage.commitUpload.mockResolvedValue({ storagePath: 'products/cover/2/new.jpg' });
  ProductImage.replaceFixed.mockRejectedValue(new Error('database failure'));
  await expect(Service.uploadProductImages({ actor, productId: 2, files: [file],
    imageKind: 'cover' })).rejects.toThrow('database failure');
  expect(imageStorage.discardStoredImage).toHaveBeenCalledWith('products/cover/2/new.jpg');
  expect(imageStorage.discardStoredImage).toHaveBeenCalledTimes(1);
});

test('invalid image content returns a validation error and removes the staged upload', async () => {
  const files = [{ path: '/tmp/fake.jpg' }];
  imageStorage.commitUpload.mockRejectedValueOnce(Object.assign(new Error('Invalid or unsupported image file'), {
    code: 'INVALID_IMAGE'
  }));
  await expect(Service.uploadProductImages({
    actor, productId: 2, files, imageKind: 'thumbnail'
  })).rejects.toMatchObject({ code: 'VALIDATION', statusCode: 400 });
  expect(imageStorage.discardUploads).toHaveBeenCalledWith(files);
});
