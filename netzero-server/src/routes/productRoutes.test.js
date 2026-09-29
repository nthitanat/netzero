jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  }
}));
jest.mock('../services/ProductService', () => ({
  createProduct: jest.fn(), getProductById: jest.fn(),
  listProducts: jest.fn(), getProductImagePath: jest.fn(), listProductImages: jest.fn()
}));

const path = require('path');
const express = require('express');
const request = require('supertest');
const ProductService = require('../services/ProductService');
const productRoutes = require('./productRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/v1/products', productRoutes);
app.use(errorHandler);

const product = {
  productId: 2, projectId: null, title: 'Item', description: 'Description',
  price: '10.00', category: 'other', type: 'market', address: null,
  coordinate: null, stockQuantity: 5, unassignedStockQuantity: 5,
  isRecommended: false, createdAt: '2026-09-24', updatedAt: '2026-09-24',
  ownerId: 7, owner: { firstName: 'A', lastName: 'B', email: 'a@example.com' },
  images: [{ role: 'thumbnail' }, { role: 'cover' }]
};

beforeEach(() => jest.clearAllMocks());

test('create maps legacy fields into service input and response', async () => {
  ProductService.createProduct.mockResolvedValue(product);
  const response = await request(app).post('/api/v1/products').send({
    title: 'Item', description: 'Description', price: 10,
    category: 'other', type: 'market', stock_quantity: 5
  });
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    id: 2, stock_quantity: 5, unassigned_stock_quantity: 5,
    user_id: 7
  });
  expect(ProductService.createProduct).toHaveBeenCalledWith({
    actor: { userId: 7, role: 'user' },
    data: expect.objectContaining({ stockQuantity: 5, price: 10 })
  });
});

test('absent product images have null URLs', async () => {
  ProductService.getProductById.mockResolvedValue({ ...product, images: [] });
  const response = await request(app).get('/api/v1/products/2');
  expect(response.body.data).toMatchObject({ thumbnail_url: null, cover_url: null });
});

test('a single product image leaves the other fixed URL null', async () => {
  ProductService.getProductById.mockResolvedValue({ ...product, images: [{ role: 'thumbnail' }] });
  const response = await request(app).get('/api/v1/products/2');
  expect(response.body.data.thumbnail_url).toContain('/products/2/thumbnail');
  expect(response.body.data.cover_url).toBeNull();
});

test('gallery metadata keeps public image numbers and display order', async () => {
  ProductService.listProductImages.mockResolvedValue([
    { imageId: 9, displayPosition: 1, filename: 'image_9.png', exists: true },
    { imageId: 3, displayPosition: 2, filename: 'image_3.jpg', exists: true }
  ]);
  const response = await request(app).get('/api/v1/products/2/images').set('Host', 'api.example.test');
  expect(response.body.data.images.map(image => image.url)).toEqual([
    'http://api.example.test/api/v1/products/2/images/9',
    'http://api.example.test/api/v1/products/2/images/3'
  ]);
  expect(response.body.data.totalImages).toBe(2);
});

test('invalid product ID is rejected before service execution', async () => {
  const response = await request(app).get('/api/v1/products/invalid');
  expect(response.status).toBe(400);
  expect(ProductService.getProductById).not.toHaveBeenCalled();
});

test('list and detail image links reach the matching product image routes', async () => {
  ProductService.listProducts.mockResolvedValue([product]);
  ProductService.getProductById.mockResolvedValue(product);
  ProductService.getProductImagePath.mockResolvedValue({
    filePath: path.resolve(__dirname, '../../../netzero-client/public/assets/images/events/event-1/poster.png'),
    mimetype: 'image/png'
  });

  for (const endpoint of ['/api/v1/products', '/api/v1/products/2']) {
    const response = await request(app).get(endpoint)
      .set('Host', 'api.example.test')
      .set('X-Forwarded-Proto', 'https');
    expect(response.status).toBe(200);
    const data = Array.isArray(response.body.data) ? response.body.data[0] : response.body.data;
    expect(data).toMatchObject({
      id: 2,
      thumbnail_url: 'https://api.example.test/api/v1/products/2/thumbnail',
      cover_url: 'https://api.example.test/api/v1/products/2/cover'
    });
    for (const [field, imageKind] of [['thumbnail_url', 'thumbnail'], ['cover_url', 'cover']]) {
      const imageResponse = await request(app).get(new URL(data[field]).pathname);
      expect(imageResponse.status).toBe(200);
      expect(imageResponse.headers['content-type']).toMatch(/^image\/png/);
      expect(ProductService.getProductImagePath).toHaveBeenCalledWith({
        productId: 2, imageKind, imageId: undefined
      });
    }
  }
});
