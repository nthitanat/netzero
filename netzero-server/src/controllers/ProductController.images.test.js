jest.mock('../services/ProductService', () => ({
  uploadProductImages: jest.fn(),
  getProductImagePath: jest.fn()
}));

const ProductService = require('../services/ProductService');
const ProductController = require('./ProductController');

function response() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    sendFile: jest.fn()
  };
}

beforeEach(() => jest.clearAllMocks());

test('upload returns the public thumbnail route instead of a disk path URL', async () => {
  ProductService.uploadProductImages.mockResolvedValue([{
    filename: 'thumbnail_42.jpg', relativePath: 'files/products/thumbnail/42/thumbnail_42.jpg',
    size: 100, mimetype: 'image/jpeg'
  }]);
  const req = {
    validated: { params: { id: 42 } }, file: { path: '/tmp/staged.jpg' }, user: { userId: 1 },
    protocol: 'https', get: () => 'example.org'
  };
  const res = response();
  await ProductController.uploadProductThumbnail(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({ url: 'https://example.org/api/v1/products/42/thumbnail' })
  }));
});

test('gallery upload returns the numbered public route', async () => {
  ProductService.uploadProductImages.mockResolvedValue([{
    filename: 'image_3.png', relativePath: 'files/products/images/42/image_3.png',
    size: 100, mimetype: 'image/png', index: 3
  }]);
  const req = {
    validated: { params: { id: 42 } }, files: [{ path: '/tmp/staged.png' }], user: { userId: 1 },
    protocol: 'https', get: () => 'example.org'
  };
  const res = response();
  await ProductController.uploadProductImages(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    data: expect.objectContaining({
      files: [expect.objectContaining({ url: 'https://example.org/api/v1/products/42/images/3' })]
    })
  }));
});

test('fetch uses the stored image MIME type', async () => {
  ProductService.getProductImagePath.mockResolvedValue({
    filePath: '/tmp/thumbnail_42.jpg', mimetype: 'image/jpeg'
  });
  const req = { validated: { params: { id: 42 } } };
  const res = response();
  await ProductController.getProductThumbnail(req, res, jest.fn());
  expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
  expect(res.sendFile).toHaveBeenCalledWith('/tmp/thumbnail_42.jpg', expect.any(Function));
});
