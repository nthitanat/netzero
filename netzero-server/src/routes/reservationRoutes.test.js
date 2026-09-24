jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 9, role: 'user' };
    next();
  }
}));
jest.mock('../services/ReservationService', () => ({
  createReservation: jest.fn(), getReservationById: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const ReservationService = require('../services/ReservationService');
const reservationRoutes = require('./reservationRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/v1/reservations', reservationRoutes);
app.use(errorHandler);

const reservation = {
  reservationId: 8, customerId: 9, productId: 2, eventId: null,
  quantity: 1, reservedUnitPrice: '15.00', note: null, shippingAddress: null,
  optionOfDelivery: 'delivery', userNote: null, sellerNote: null,
  pickupDate: null, status: 'pending', createdAt: '2026-09-24', updatedAt: '2026-09-24',
  product: { id: 2, title: 'Item', price: '15.00', type: 'market', ownerId: 7 },
  customer: { firstName: 'A', lastName: 'B', email: 'a@example.com', phone: null },
  owner: { firstName: 'C', lastName: 'D', email: 'c@example.com' }, event: null
};

beforeEach(() => jest.clearAllMocks());

test('create keeps the v1 response and maps input to camelCase', async () => {
  ReservationService.createReservation.mockResolvedValue(reservation);
  const response = await request(app).post('/api/v1/reservations').send({
    product_id: 2, quantity: 1, reserved_unit_price: 15
  });
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    reservation_id: 8, user_id: 9, product_id: 2,
    reserved_unit_price: '15.00', product: { owner_id: 7 }
  });
  expect(ReservationService.createReservation).toHaveBeenCalledWith({
    actor: { userId: 9, role: 'user' },
    data: expect.objectContaining({ productId: 2, quantity: 1, reservedUnitPrice: 15 })
  });
});

test('invalid ID is rejected before the service is called', async () => {
  const response = await request(app).get('/api/v1/reservations/not-an-id');
  expect(response.status).toBe(400);
  expect(ReservationService.getReservationById).not.toHaveBeenCalled();
});
