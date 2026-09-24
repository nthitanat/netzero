jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  }
}));
jest.mock('../services/UserEventService', () => ({
  joinEvent: jest.fn(), getUserEvents: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const Service = require('../services/UserEventService');
const userEventRoutes = require('./userEventRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/user-events', userEventRoutes);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('join forwards actor and parsed IDs to service', async () => {
  Service.joinEvent.mockResolvedValue(4);
  const response = await request(app).post('/api/v1/user-events/join').send({
    userId: 7, eventId: 2
  });
  expect(response.status).toBe(201);
  expect(response.body.data).toEqual({ id: 4 });
  expect(Service.joinEvent).toHaveBeenCalledWith({
    actor: { userId: 7, role: 'user' }, userId: 7, eventId: 2
  });
});

test('invalid user ID is rejected before service execution', async () => {
  const response = await request(app).get('/api/v1/user-events/user/abc/events');
  expect(response.status).toBe(400);
  expect(Service.getUserEvents).not.toHaveBeenCalled();
});
