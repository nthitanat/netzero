jest.mock('../models/ProductReservation', () => ({
  findById: jest.fn(), findAll: jest.fn(), insert: jest.fn(), lockById: jest.fn(),
  updateFields: jest.fn(), transitionPending: jest.fn(), deleteById: jest.fn(),
  getOwnerStats: jest.fn()
}));
jest.mock('../models/ReservationStock', () => ({
  findProductById: jest.fn(), findEventStock: jest.fn(),
  decrementProductStock: jest.fn(), decrementEventStock: jest.fn()
}));
jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));

const Reservation = require('../models/ProductReservation');
const ReservationStock = require('../models/ReservationStock');
const { withTransaction } = require('../config/database');
const Service = require('./ReservationService');

const tx = { execute: jest.fn() };
const seller = { userId: 7, role: 'user' };
const customer = { userId: 9, role: 'user' };
const pendingReservation = {
  reservationId: 4, customerId: 9, productId: 2, eventId: 3,
  optionOfDelivery: 'event', quantity: 2, status: 'pending', product: { ownerId: 7 }
};

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation(operation => operation(tx));
  Reservation.lockById.mockResolvedValue(true);
  Reservation.findById.mockResolvedValue(pendingReservation);
  Reservation.transitionPending.mockResolvedValue(true);
  ReservationStock.decrementEventStock.mockResolvedValue(true);
  ReservationStock.decrementProductStock.mockResolvedValue(true);
});

test('confirmation uses one transaction context for stock and status', async () => {
  await Service.confirmReservation({ actor: seller, reservationId: 4 });
  expect(Reservation.lockById).toHaveBeenCalledWith(4, { tx });
  expect(Reservation.findById).toHaveBeenCalledWith(4, { tx });
  expect(ReservationStock.decrementEventStock).toHaveBeenCalledWith(
    { eventId: 3, productId: 2, quantity: 2 }, { tx }
  );
  expect(ReservationStock.decrementProductStock).toHaveBeenCalledWith(
    { productId: 2, quantity: 2, isEvent: true }, { tx }
  );
  expect(Reservation.transitionPending).toHaveBeenCalledWith(4, 'confirmed', { tx });
});

test('stock failure prevents confirmation status change', async () => {
  ReservationStock.decrementEventStock.mockResolvedValue(false);
  await expect(Service.confirmReservation({ actor: seller, reservationId: 4 }))
    .rejects.toMatchObject({ code: 'CONFLICT' });
  expect(ReservationStock.decrementProductStock).not.toHaveBeenCalled();
  expect(Reservation.transitionPending).not.toHaveBeenCalled();
});

test('a customer cannot confirm a reservation', async () => {
  await expect(Service.confirmReservation({ actor: customer, reservationId: 4 }))
    .rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(ReservationStock.decrementEventStock).not.toHaveBeenCalled();
});

test('status endpoint delegates confirmation to the stock workflow', async () => {
  await Service.updateReservationStatus({ actor: seller, reservationId: 4, status: 'confirmed' });
  expect(ReservationStock.decrementProductStock).toHaveBeenCalledTimes(1);
  expect(Reservation.transitionPending).toHaveBeenCalledWith(4, 'confirmed', { tx });
});

test('non-admin lists are scoped to the actor', async () => {
  Reservation.findAll.mockResolvedValue([]);
  await Service.listReservations({ actor: customer, filters: { ownerId: 7 } });
  expect(Reservation.findAll).toHaveBeenCalledWith(expect.objectContaining({
    ownerId: 7, visibleToActorId: 9
  }));
});
