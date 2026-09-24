jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  },
  optionalAuth: (req, res, next) => next()
}));
jest.mock('../services/ChatAppService', () => ({
  createChatApp: jest.fn(), getChatAppById: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const ChatAppService = require('../services/ChatAppService');
const chatAppRoutes = require('./chatAppRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/chatapps', chatAppRoutes);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('create returns a response with legacy fields', async () => {
  ChatAppService.createChatApp.mockResolvedValue({
    chatId: 'chat-1', ownerId: 7, productId: 2, title: 'Chat',
    description: null, status: 'active', isActive: true,
    createdAt: null, updatedAt: null
  });
  const response = await request(app).post('/api/v1/chatapps').send({
    product_id: 2, title: 'Chat'
  });
  expect(response.status).toBe(201);
  expect(response.body.data.chatApp).toMatchObject({
    id: 'chat-1', owner_id: 7, product_id: 2
  });
});

test('invalid product ID is rejected before service execution', async () => {
  const response = await request(app).post('/api/v1/chatapps').send({
    product_id: 'bad', title: 'Chat'
  });
  expect(response.status).toBe(400);
  expect(ChatAppService.createChatApp).not.toHaveBeenCalled();
});
