const UserEvent = require('../models/UserEvent');
const Event = require('../models/Event');
const { applicationError } = require('../errors/applicationError');

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function assertCanActForUser(actor, userId) {
  if (actorId(actor) !== userId && actor.role !== 'admin') {
    throw applicationError('FORBIDDEN', 'Access denied');
  }
}

async function getUserEvents({ userId }) {
  return UserEvent.listEventsByUserId(userId);
}

async function getMyEvents({ actor }) {
  return UserEvent.listEventsByUserId(actorId(actor));
}

async function joinEvent({ actor, userId, eventId }) {
  assertCanActForUser(actor, userId);
  const event = await Event.findById(eventId);
  if (!event) throw applicationError('NOT_FOUND', 'Event not found');
  try {
    return await UserEvent.insert({ userId, eventId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw applicationError('CONFLICT', 'User is already associated with this event', { cause: error });
    }
    throw error;
  }
}

async function leaveEvent({ actor, userId, eventId }) {
  assertCanActForUser(actor, userId);
  const didRemove = await UserEvent.remove({ userId, eventId });
  if (!didRemove) throw applicationError('NOT_FOUND', 'User-event relationship not found');
}

async function getEventUsers({ eventId }) {
  return UserEvent.listUsersByEventId(eventId);
}

async function checkOwnership({ userId, eventId }) {
  return UserEvent.hasAssociation({ userId, eventId });
}

module.exports = {
  getUserEvents,
  getMyEvents,
  joinEvent,
  leaveEvent,
  getEventUsers,
  checkOwnership
};
