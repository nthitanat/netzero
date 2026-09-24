jest.mock('../models/Product', () => ({
  findById: jest.fn(), findAll: jest.fn(), insert: jest.fn(), lockById: jest.fn(),
  updateById: jest.fn(), deleteById: jest.fn()
}));
jest.mock('../adapters/productImageStorage', () => ({
  findImage: jest.fn(), listImages: jest.fn(), commitUpload: jest.fn(),
  discardUploads: jest.fn(), discardCommittedImage: jest.fn()
}));
jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));

const Product = require('../models/Product');
const imageStorage = require('../adapters/productImageStorage');
const { withTransaction } = require('../config/database');
const Service = require('./ProductService');

const actor = { userId: 7, role: 'user' };
const product = {
  productId: 2, ownerId: 7, stockQuantity: 10, unassignedStockQuantity: 6
};
const tx = { execute: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation(operation => operation(tx));
  Product.lockById.mockResolvedValue(true);
  Product.findById.mockResolvedValue(product);
  Product.updateById.mockResolvedValue(true);
  imageStorage.discardUploads.mockResolvedValue();
  imageStorage.discardCommittedImage.mockResolvedValue();
  imageStorage.listImages.mockResolvedValue([]);
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
    .mockResolvedValueOnce({ index: 3 })
    .mockRejectedValueOnce(new Error('disk full'));
  await expect(Service.uploadProductImages({
    actor, productId: 2, files, imageKind: 'images'
  })).rejects.toThrow('disk full');
  expect(imageStorage.discardCommittedImage).toHaveBeenCalledWith({ productId: 2, imageId: 3 });
  expect(imageStorage.discardUploads).toHaveBeenCalledWith(files);
});
