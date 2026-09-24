jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => { req.user = { userId: 7, role: 'user' }; next(); }
}));
jest.mock('../middleware/rateLimiter', () => ({ authLimiter: (req, res, next) => next() }));
jest.mock('../services/AuthService', () => ({
  register: jest.fn(), login: jest.fn(), verifyToken: jest.fn(), refreshToken: jest.fn(), logout: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const Service = require('../services/AuthService');
const router = require('./authRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', router);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('registration passes normalized input and preserves user response', async () => {
  Service.register.mockResolvedValue({
    token: 'signed', user: { userId: 7, email: 'user@example.com', firstName: 'Test', lastName: 'User' }
  });
  const response = await request(app).post('/api/v1/auth/register').send({
    email: 'USER@EXAMPLE.COM', password: 'secret123', firstName: 'Test', lastName: 'User'
  });
  expect(response.status).toBe(201);
  expect(Service.register).toHaveBeenCalledWith({ data: {
    email: 'user@example.com', password: 'secret123', firstName: 'Test', lastName: 'User'
  } });
  expect(response.body.data.user.id).toBe(7);
  expect(response.body.data.user.passwordHash).toBeUndefined();
});

test('invalid registration fails before service call', async () => {
  const response = await request(app).post('/api/v1/auth/register').send({ email: 'bad' });
  expect(response.status).toBe(400);
  expect(Service.register).not.toHaveBeenCalled();
});
