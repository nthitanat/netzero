jest.mock('../models/EventProduct', () => ({
  findById: jest.fn(), lockById: jest.fn(), findByEventAndProduct: jest.fn(),
  findEventById: jest.fn(), insert: jest.fn(),
  updateById: jest.fn(), deleteById: jest.fn(), adjustUnassignedStock: jest.fn(),
  countPendingReservations: jest.fn()
}));
jest.mock('../models/ReservationStock', () => ({ findProductById: jest.fn() }));
jest.mock('../models/UserEvent', () => ({ hasAssociation: jest.fn() }));
jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));

const EventProduct = require('../models/EventProduct');
const ReservationStock = require('../models/ReservationStock');
const UserEvent = require('../models/UserEvent');
const { withTransaction } = require('../config/database');
const Service = require('./EventProductService');

const tx = { execute: jest.fn() };
const actor = { userId: 5, role: 'user' };
const product = { productId: 2, ownerId: 5, unassignedStockQuantity: 4 };
const existing = {
  eventProductId: 8, eventId: 3, productId: 2, eventPrice: '10.00',
  stockQuantity: 2, status: 'confirmed'
};

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation(operation => operation(tx));
  EventProduct.findEventById.mockResolvedValue({ eventId: 3, title: 'Event' });
  ReservationStock.findProductById.mockResolvedValue(product);
  EventProduct.findByEventAndProduct.mockResolvedValue(null);
  UserEvent.hasAssociation.mockResolvedValue(true);
  EventProduct.adjustUnassignedStock.mockResolvedValue(true);
  EventProduct.insert.mockResolvedValue(8);
  EventProduct.findById.mockResolvedValue(existing);
  EventProduct.lockById.mockResolvedValue(true);
  EventProduct.countPendingReservations.mockResolvedValue(0);
  EventProduct.deleteById.mockResolvedValue(true);
});

test('creation assigns stock and inserts on the same transaction', async () => {
  await Service.createEventProduct({
    actor, data: { eventId: 3, productId: 2, eventPrice: 10, stockQuantity: 2 }
  });
  expect(EventProduct.adjustUnassignedStock).toHaveBeenCalledWith(
    { productId: 2, quantityChange: -2 }, { tx }
  );
  expect(EventProduct.insert).toHaveBeenCalledWith(expect.objectContaining({
    status: 'confirmed', stockQuantity: 2
  }), { tx });
});

test('failed stock assignment prevents insertion', async () => {
  EventProduct.adjustUnassignedStock.mockResolvedValue(false);
  await expect(Service.createEventProduct({
    actor, data: { eventId: 3, productId: 2, eventPrice: 10, stockQuantity: 5 }
  })).rejects.toMatchObject({ code: 'CONFLICT' });
  expect(EventProduct.insert).not.toHaveBeenCalled();
});

test('event associate without product ownership cannot change stock', async () => {
  ReservationStock.findProductById.mockResolvedValue({ ...product, ownerId: 7 });
  await expect(Service.updateEventProduct({
    actor, eventProductId: 8, updates: { stockQuantity: 3 }
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(EventProduct.updateById).not.toHaveBeenCalled();
});

test('deletion restores remaining stock in its transaction', async () => {
  await Service.deleteEventProduct({ actor, eventProductId: 8 });
  expect(EventProduct.lockById).toHaveBeenCalledWith(8, { tx });
  expect(EventProduct.adjustUnassignedStock).toHaveBeenCalledWith(
    { productId: 2, quantityChange: 2 }, { tx }
  );
  expect(EventProduct.deleteById).toHaveBeenCalledWith(8, { tx });
});

test('event product with pending reservations cannot be deleted', async () => {
  EventProduct.countPendingReservations.mockResolvedValue(1);
  await expect(Service.deleteEventProduct({ actor, eventProductId: 8 }))
    .rejects.toMatchObject({ code: 'CONFLICT' });
  expect(EventProduct.deleteById).not.toHaveBeenCalled();
});
