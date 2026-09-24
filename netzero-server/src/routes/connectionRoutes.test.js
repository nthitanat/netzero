jest.mock('../services/ConnectionService', () => ({
  getConnectionInfo: jest.fn(() => ({ status: 'connected' })),
  checkDatabase: jest.fn(),
  getSystemStatus: jest.fn(),
  ping: jest.fn(() => ({ message: 'pong' })),
  echo: jest.fn(input => input)
}));

const express = require('express');
const request = require('supertest');
const ConnectionService = require('../services/ConnectionService');
const connectionRoutes = require('./connectionRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/connection', connectionRoutes);
app.use(errorHandler);

beforeEach(() => jest.clearAllMocks());

test('connection test returns a JSON response', async () => {
  const response = await request(app).get('/api/v1/connection/test');
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    success: true, message: 'Remote connection established successfully',
    data: { status: 'connected' }
  });
});

test('database failure returns 503 without a raw error', async () => {
  ConnectionService.checkDatabase.mockResolvedValue({ isConnected: false, connectionTime: '5ms' });
  const response = await request(app).get('/api/v1/connection/database');
  expect(response.status).toBe(503);
  expect(response.body.message).toBe('Database connection failed');
});
