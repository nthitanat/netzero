const config = require('../config/env');
const Event = require('../models/Event');
const UserEvent = require('../models/UserEvent');
const imageStorage = require('../adapters/eventImageStorage');
const { withTransaction } = require('../config/database');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const EVENT_STATUS = Object.freeze({ ACTIVE: 'active' });

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function pageOptions({ limit, offset } = {}) {
  return {
    limit: Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: offset ?? 0
  };
}

async function requireEvent(eventId) {
  const event = await Event.findById(eventId);
  if (!event) throw applicationError('NOT_FOUND', 'Event not found');
  return event;
}

async function assertEventAccess(actor, eventId) {
  if (!await UserEvent.hasAssociation({ userId: actorId(actor), eventId })) {
    throw applicationError('FORBIDDEN', 'User does not have permission to access this event');
  }
}

async function listEvents({ page }) {
  return Event.findAll(pageOptions(page));
}

async function getEventById({ eventId }) {
  return requireEvent(eventId);
}

async function listEventsByCategory({ category, page }) {
  return Event.findByCategory(category, pageOptions(page));
}

async function searchEventsByName({ name, page }) {
  return Event.findByName(name, pageOptions(page));
}

async function listRecommendedEvents({ page }) {
  return Event.findRecommended(pageOptions(page));
}

async function createEvent({ actor, data }) {
  if (new Date(data.eventDate) <= new Date()) {
    throw applicationError('VALIDATION', 'Event date must be in the future');
  }
  const eventId = await withTransaction(async (tx) => {
    const createdEventId = await Event.insert({
      ...data,
      status: data.status ?? EVENT_STATUS.ACTIVE
    }, { tx });
    await UserEvent.insert({ userId: actorId(actor), eventId: createdEventId }, { tx });
    return createdEventId;
  });
  return Event.findById(eventId);
}

async function updateEvent({ actor, eventId, updates }) {
  await requireEvent(eventId);
  await assertEventAccess(actor, eventId);
  if (updates.eventDate !== undefined && new Date(updates.eventDate) <= new Date()) {
    throw applicationError('VALIDATION', 'Event date must be in the future');
  }
  const didUpdate = await Event.updateByIdOwned({ eventId, actorId: actorId(actor), updates });
  if (!didUpdate) throw applicationError('NOT_FOUND', 'Event not found or no changes made');
  return Event.findById(eventId);
}

async function cancelEvent({ actor, eventId }) {
  await requireEvent(eventId);
  await assertEventAccess(actor, eventId);
  const didCancel = await Event.cancelByIdOwned({ eventId, actorId: actorId(actor) });
  if (!didCancel) throw applicationError('NOT_FOUND', 'Event not found or already cancelled');
}

async function deleteEvent({ actor, eventId }) {
  await requireEvent(eventId);
  await assertEventAccess(actor, eventId);
  const didDelete = await Event.deleteByIdOwned({ eventId, actorId: actorId(actor) });
  if (!didDelete) throw applicationError('NOT_FOUND', 'Event not found or already deleted');
}

async function getEventImagePath({ eventId, imageType }) {
  const imagePath = await imageStorage.findEventImage({ eventId, imageType });
  if (!imagePath) {
    throw applicationError('NOT_FOUND', `${imageType === 'poster' ? 'Poster' : 'Thumbnail'} image file not found`);
  }
  return imagePath;
}

module.exports = {
  listEvents,
  getEventById,
  listEventsByCategory,
  searchEventsByName,
  listRecommendedEvents,
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
  getEventImagePath
};
