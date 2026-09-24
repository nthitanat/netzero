jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 5, role: 'user' };
    next();
  }
}));
jest.mock('../services/EventProductService', () => ({
  createEventProduct: jest.fn(), updateEventProduct: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const EventProductService = require('../services/EventProductService');
const eventProductRoutes = require('./eventProductRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/event-products', eventProductRoutes);
app.use(errorHandler);

const item = {
  eventProductId: 8, eventId: 3, productId: 2, eventPrice: '10.00',
  stockQuantity: 2, status: 'confirmed', createdAt: '2026-09-24', updatedAt: '2026-09-24'
};

beforeEach(() => jest.clearAllMocks());

test('create preserves v1 field names and passes named domain input', async () => {
  EventProductService.createEventProduct.mockResolvedValue(item);
  const response = await request(app).post('/api/v1/event-products').send({
    event_id: 3, product_id: 2, event_price: 10, stock_quantity: 2
  });
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    id: 8, event_id: 3, product_id: 2, event_price: 10, stock_quantity: 2
  });
  expect(EventProductService.createEventProduct).toHaveBeenCalledWith({
    actor: { userId: 5, role: 'user' },
    data: { eventId: 3, productId: 2, eventPrice: 10, stockQuantity: 2 }
  });
});

test('negative stock is rejected before service execution', async () => {
  const response = await request(app).post('/api/v1/event-products').send({
    event_id: 3, product_id: 2, event_price: 10, stock_quantity: -1
  });
  expect(response.status).toBe(400);
  expect(EventProductService.createEventProduct).not.toHaveBeenCalled();
});
