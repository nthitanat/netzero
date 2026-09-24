jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => { req.user = { userId: 7, role: 'user' }; next(); },
  authorizeRoles: () => (req, res, next) => next()
}));
jest.mock('../services/UserService', () => ({
  getUserById: jest.fn(), getCurrentUser: jest.fn(), listUsers: jest.fn(),
  updateUser: jest.fn(), updatePassword: jest.fn(), deleteUser: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const Service = require('../services/UserService');
const router = require('./userRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/users', router);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('me route wins over numeric user ID route', async () => {
  Service.getCurrentUser.mockResolvedValue({ userId: 7, email: 'user@example.com' });
  const response = await request(app).get('/api/v1/users/me');
  expect(response.status).toBe(200);
  expect(response.body.data.user.id).toBe(7);
  expect(Service.getUserById).not.toHaveBeenCalled();
});

test('password update uses parsed ID and actor', async () => {
  const response = await request(app).put('/api/v1/users/7/password').send({
    currentPassword: 'oldsecret', newPassword: 'newsecret'
  });
  expect(response.status).toBe(200);
  expect(Service.updatePassword).toHaveBeenCalledWith({
    actor: { userId: 7, role: 'user' }, userId: 7,
    currentPassword: 'oldsecret', newPassword: 'newsecret'
  });
});

test('invalid user ID fails before service call', async () => {
  const response = await request(app).get('/api/v1/users/abc');
  expect(response.status).toBe(400);
  expect(Service.getUserById).not.toHaveBeenCalled();
});
