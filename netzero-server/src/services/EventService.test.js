jest.mock('../models/Event', () => ({
  findAll: jest.fn(), findById: jest.fn(), findByCategory: jest.fn(),
  findByName: jest.fn(), findRecommended: jest.fn(), insert: jest.fn(),
  updateByIdOwned: jest.fn(), cancelByIdOwned: jest.fn(), deleteByIdOwned: jest.fn()
}));
jest.mock('../models/UserEvent', () => ({
  insert: jest.fn(), hasAssociation: jest.fn()
}));
jest.mock('../adapters/eventImageStorage', () => ({ findEventImage: jest.fn() }));
jest.mock('../config/database', () => ({ withTransaction: jest.fn() }));

const Event = require('../models/Event');
const UserEvent = require('../models/UserEvent');
const { withTransaction } = require('../config/database');
const Service = require('./EventService');

const tx = { execute: jest.fn() };
const actor = { userId: 7, role: 'user' };

beforeEach(() => {
  jest.clearAllMocks();
  withTransaction.mockImplementation(operation => operation(tx));
  Event.insert.mockResolvedValue(11);
  Event.findById.mockResolvedValue({ eventId: 11, title: 'Event' });
  UserEvent.hasAssociation.mockResolvedValue(true);
  Event.updateByIdOwned.mockResolvedValue(true);
});

test('event creation and creator association share the transaction', async () => {
  const eventDate = new Date(Date.now() + 86400000);
  await Service.createEvent({ actor, data: { title: 'Event', eventDate } });
  expect(Event.insert).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Event', status: 'active'
  }), { tx });
  expect(UserEvent.insert).toHaveBeenCalledWith({ userId: 7, eventId: 11 }, { tx });
});

test('past event date is rejected before insertion', async () => {
  await expect(Service.createEvent({
    actor, data: { title: 'Past', eventDate: new Date(0) }
  })).rejects.toMatchObject({ code: 'VALIDATION' });
  expect(Event.insert).not.toHaveBeenCalled();
});

test('update requires stored event association', async () => {
  UserEvent.hasAssociation.mockResolvedValue(false);
  await expect(Service.updateEvent({
    actor, eventId: 11, updates: { title: 'New title' }
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(Event.updateByIdOwned).not.toHaveBeenCalled();
});
