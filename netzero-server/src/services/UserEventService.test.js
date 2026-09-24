jest.mock('../models/UserEvent', () => ({
  insert: jest.fn(), remove: jest.fn(), hasAssociation: jest.fn(),
  listEventsByUserId: jest.fn(), listUsersByEventId: jest.fn()
}));
jest.mock('../models/Event', () => ({ findById: jest.fn() }));

const UserEvent = require('../models/UserEvent');
const Event = require('../models/Event');
const Service = require('./UserEventService');

beforeEach(() => {
  jest.clearAllMocks();
  Event.findById.mockResolvedValue({ eventId: 2 });
  UserEvent.insert.mockResolvedValue(4);
});

test('user cannot join another account to an event', async () => {
  await expect(Service.joinEvent({
    actor: { userId: 7, role: 'user' }, userId: 8, eventId: 2
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(UserEvent.insert).not.toHaveBeenCalled();
});

test('user joins as the authenticated actor', async () => {
  const membershipId = await Service.joinEvent({
    actor: { userId: 7, role: 'user' }, userId: 7, eventId: 2
  });
  expect(membershipId).toBe(4);
  expect(UserEvent.insert).toHaveBeenCalledWith({ userId: 7, eventId: 2 });
});

test('user cannot remove another account from an event', async () => {
  await expect(Service.leaveEvent({
    actor: { userId: 7, role: 'user' }, userId: 8, eventId: 2
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(UserEvent.remove).not.toHaveBeenCalled();
});
