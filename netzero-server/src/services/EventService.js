const config = require('../config/env');
const Event = require('../models/Event');
const EventImage = require('../models/EventImage');
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
  return attachImages(await Event.findAll(pageOptions(page)));
}

async function getEventById({ eventId }) {
  return attachOne(await requireEvent(eventId));
}

async function attachImages(events) {
  if (!events.length) return events;
  const rows = await EventImage.findForEvents(events.map(event => event.eventId));
  const byEvent = new Map();
  for (const row of rows) {
    if (!byEvent.has(row.eventId)) byEvent.set(row.eventId, []);
    byEvent.get(row.eventId).push(row);
  }
  return events.map(event => ({ ...event, images: byEvent.get(event.eventId) || [] }));
}

async function attachOne(event) {
  return (await attachImages([event]))[0];
}

async function listEventsByCategory({ category, page }) {
  return attachImages(await Event.findByCategory(category, pageOptions(page)));
}

async function searchEventsByName({ name, page }) {
  return attachImages(await Event.findByName(name, pageOptions(page)));
}

async function listRecommendedEvents({ page }) {
  return attachImages(await Event.findRecommended(pageOptions(page)));
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
  return attachOne(await Event.findById(eventId));
}

async function updateEvent({ actor, eventId, updates }) {
  await requireEvent(eventId);
  await assertEventAccess(actor, eventId);
  if (updates.eventDate !== undefined && new Date(updates.eventDate) <= new Date()) {
    throw applicationError('VALIDATION', 'Event date must be in the future');
  }
  const didUpdate = await Event.updateByIdOwned({ eventId, actorId: actorId(actor), updates });
  if (!didUpdate) throw applicationError('NOT_FOUND', 'Event not found or no changes made');
  return attachOne(await Event.findById(eventId));
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
  const image = await EventImage.findOne({ eventId, role: imageType });
  if (image) return { filePath: imageStorage.resolveStoragePath(image.relativePath),
    mimetype: image.mimetype, version: image.version };
  if (!config.imageMetadataReadsEnabled) {
    const filePath = await imageStorage.findEventImage({ eventId, imageType });
    if (filePath) return { filePath, mimetype: 'image/png' };
  }
  throw applicationError('NOT_FOUND', `${imageType === 'poster' ? 'Poster' : 'Thumbnail'} image file not found`);
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
