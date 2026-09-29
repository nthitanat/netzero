jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 7, role: 'user' };
    next();
  }
}));
jest.mock('../services/EventService', () => ({
  createEvent: jest.fn(), getEventById: jest.fn(),
  listEvents: jest.fn(), getEventImagePath: jest.fn()
}));

const path = require('path');
const express = require('express');
const request = require('supertest');
const EventService = require('../services/EventService');
const eventRoutes = require('./eventRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/v1/events', eventRoutes);
app.use(errorHandler);

const event = {
  eventId: 11, title: 'Event', description: null, eventDate: '2027-01-01',
  location: null, category: null, organizer: null, contactEmail: null,
  contactPhone: null, maxParticipants: 0, currentParticipants: 0,
  registrationDeadline: null, status: 'active', createdAt: '2026-09-24',
  updatedAt: '2026-09-24', isRecommended: false,
  images: [{ role: 'thumbnail' }, { role: 'poster' }]
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

test('absent event images have null URLs', async () => {
  EventService.getEventById.mockResolvedValue({ ...event, images: [] });
  const response = await request(app).get('/api/v1/events/11');
  expect(response.body.data).toMatchObject({ thumbnail_url: null, poster_url: null });
});

test('invalid event ID is rejected before service execution', async () => {
  const response = await request(app).get('/api/v1/events/abc');
  expect(response.status).toBe(400);
  expect(EventService.getEventById).not.toHaveBeenCalled();
});

test('list and detail image links reach the matching event image routes', async () => {
  EventService.listEvents.mockResolvedValue([event]);
  EventService.getEventById.mockResolvedValue(event);
  EventService.getEventImagePath.mockResolvedValue({
    filePath: path.resolve(__dirname, '../../../netzero-client/public/assets/images/events/event-1/poster.png'),
    mimetype: 'image/png'
  });

  for (const endpoint of ['/api/v1/events', '/api/v1/events/11']) {
    const response = await request(app).get(endpoint)
      .set('Host', 'api.example.test')
      .set('X-Forwarded-Proto', 'https');
    expect(response.status).toBe(200);
    const data = Array.isArray(response.body.data) ? response.body.data[0] : response.body.data;
    expect(data).toMatchObject({
      id: 11,
      thumbnail_url: 'https://api.example.test/api/v1/events/11/thumbnail',
      poster_url: 'https://api.example.test/api/v1/events/11/poster'
    });
    for (const [field, imageType] of [['thumbnail_url', 'thumbnail'], ['poster_url', 'poster']]) {
      const imageResponse = await request(app).get(new URL(data[field]).pathname);
      expect(imageResponse.status).toBe(200);
      expect(imageResponse.headers['content-type']).toMatch(/^image\/png/);
      expect(EventService.getEventImagePath).toHaveBeenCalledWith({ eventId: 11, imageType });
    }
  }
});
