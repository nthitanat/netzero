jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  }
}));
jest.mock('../services/ProductService', () => ({
  createProduct: jest.fn(), getProductById: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const ProductService = require('../services/ProductService');
const productRoutes = require('./productRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/products', productRoutes);
app.use(errorHandler);

const product = {
  productId: 2, projectId: null, title: 'Item', description: 'Description',
  price: '10.00', category: 'other', type: 'market', address: null,
  coordinate: null, stockQuantity: 5, unassignedStockQuantity: 5,
  isRecommended: false, createdAt: '2026-09-24', updatedAt: '2026-09-24',
  ownerId: 7, owner: { firstName: 'A', lastName: 'B', email: 'a@example.com' }
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

test('invalid product ID is rejected before service execution', async () => {
  const response = await request(app).get('/api/v1/products/invalid');
  expect(response.status).toBe(400);
  expect(ProductService.getProductById).not.toHaveBeenCalled();
});
