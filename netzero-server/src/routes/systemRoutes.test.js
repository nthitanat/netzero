jest.mock('../services/SystemService', () => ({
  getHealth: jest.fn(() => ({ environment: 'test', version: '1', uptime: 1, memory: {} })),
  getApiInfo: jest.fn(() => ({ version: '1', apiPrefix: '/api', apiVersion: 'v1' })),
  checkDatabase: jest.fn(async () => ({ host: 'localhost' }))
}));

const express = require('express');
const request = require('supertest');
const router = require('./systemRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use('/', router);
app.use(errorHandler);

test('root metadata remains at the top level', async () => {
  const response = await request(app).get('/');
  expect(response.status).toBe(200);
  expect(response.body.documentation.events).toBe('/api/v1/events');
  expect(response.body.data).toBeUndefined();
});

test('database diagnostic retains its top-level database field', async () => {
  const response = await request(app).get('/db-test');
  expect(response.status).toBe(200);
  expect(response.body.database).toEqual({ host: 'localhost' });
});
