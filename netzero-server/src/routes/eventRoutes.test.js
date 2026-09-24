jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  }
}));
jest.mock('../services/EventService', () => ({
  createEvent: jest.fn(), getEventById: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const EventService = require('../services/EventService');
const eventRoutes = require('./eventRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/events', eventRoutes);
app.use(errorHandler);

const event = {
  eventId: 11, title: 'Event', description: null, eventDate: '2027-01-01',
  location: null, category: null, organizer: null, contactEmail: null,
  contactPhone: null, maxParticipants: 0, currentParticipants: 0,
  registrationDeadline: null, status: 'active', createdAt: '2026-09-24',
  updatedAt: '2026-09-24', isRecommended: false
};

beforeEach(() => jest.clearAllMocks());

test('create keeps legacy event_date response and maps service input', async () => {
  EventService.createEvent.mockResolvedValue(event);
  const response = await request(app).post('/api/v1/events').send({
    title: 'Event', event_date: '2027-01-01'
  });
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({ id: 11, event_date: '2027-01-01' });
  expect(EventService.createEvent).toHaveBeenCalledWith({
    actor: { userId: 7, role: 'user' },
    data: expect.objectContaining({ title: 'Event', eventDate: expect.any(Date) })
  });
});

test('invalid event ID is rejected before service execution', async () => {
  const response = await request(app).get('/api/v1/events/abc');
  expect(response.status).toBe(400);
  expect(EventService.getEventById).not.toHaveBeenCalled();
});
