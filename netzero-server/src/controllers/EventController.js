const config = require('../config/env');
const EventService = require('../services/EventService');
const { sendSuccess } = require('../middleware/response');

const IMAGE_CACHE_SECONDS = config.cache.imageMaxAgeSeconds;

function serializeEvent(event) {
  return {
    id: event.eventId,
    title: event.title,
    description: event.description,
    event_date: event.eventDate,
    location: event.location,
    category: event.category,
    organizer: event.organizer,
    contact_email: event.contactEmail,
    contact_phone: event.contactPhone,
    max_participants: event.maxParticipants,
    current_participants: event.currentParticipants,
    registration_deadline: event.registrationDeadline,
    status: event.status,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
    isRecommended: event.isRecommended
  };
}

function mapEventInput(body) {
  const fields = {
    title: 'title',
    description: 'description',
    event_date: 'eventDate',
    location: 'location',
    category: 'category',
    organizer: 'organizer',
    contact_email: 'contactEmail',
    contact_phone: 'contactPhone',
    max_participants: 'maxParticipants',
    registration_deadline: 'registrationDeadline',
    status: 'status',
    isRecommended: 'isRecommended'
  };
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([apiName]) => body[apiName] !== undefined)
      .map(([apiName, domainName]) => [domainName, body[apiName]])
  );
}

async function getAllEvents(req, res) {
  const events = await EventService.listEvents({ page: req.validated.query });
  return sendSuccess(res, {
    message: 'Events retrieved successfully',
    data: events.map(serializeEvent),
    count: events.length
  });
}

async function getEventById(req, res) {
  const event = await EventService.getEventById({ eventId: req.validated.params.id });
  return sendSuccess(res, { message: 'Event retrieved successfully', data: serializeEvent(event) });
}

async function getEventImage(req, res, next, imageType) {
  const imagePath = await EventService.getEventImagePath({
    eventId: req.validated.params.id,
    imageType
  });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', `public, max-age=${IMAGE_CACHE_SECONDS}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendFile(imagePath, error => {
    if (error && !res.headersSent) next(error);
  });
}

async function getEventPosterImage(req, res, next) {
  return getEventImage(req, res, next, 'poster');
}

async function getEventThumbnail(req, res, next) {
  return getEventImage(req, res, next, 'thumbnail');
}

async function getEventsByCategory(req, res) {
  const category = req.validated.params.category;
  const events = await EventService.listEventsByCategory({
    category,
    page: req.validated.query
  });
  return sendSuccess(res, {
    message: `Events in category '${category}' retrieved successfully`,
    data: events.map(serializeEvent),
    count: events.length,
    category
  });
}

async function getEventByName(req, res) {
  const name = req.validated.params.name;
  const events = await EventService.searchEventsByName({ name, page: req.validated.query });
  return sendSuccess(res, {
    message: `Events matching '${name}' retrieved successfully`,
    data: events.map(serializeEvent),
    count: events.length,
    searchTerm: name
  });
}

async function getRecommendedEvents(req, res) {
  const events = await EventService.listRecommendedEvents({ page: req.validated.query });
  return sendSuccess(res, {
    message: 'Recommended events retrieved successfully',
    data: events.map(serializeEvent),
    count: events.length
  });
}

async function createEvent(req, res) {
  const event = await EventService.createEvent({
    actor: req.user,
    data: mapEventInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Event created successfully',
    data: serializeEvent(event),
    statusCode: 201
  });
}

async function deleteEvent(req, res) {
  await EventService.deleteEvent({ actor: req.user, eventId: req.validated.params.id });
  return sendSuccess(res, { message: 'Event deleted successfully' });
}

async function cancelEvent(req, res) {
  await EventService.cancelEvent({ actor: req.user, eventId: req.validated.params.id });
  return sendSuccess(res, { message: 'Event cancelled successfully' });
}

async function updateEvent(req, res) {
  const event = await EventService.updateEvent({
    actor: req.user,
    eventId: req.validated.params.id,
    updates: mapEventInput(req.validated.body)
  });
  return sendSuccess(res, {
    message: 'Event updated successfully',
    data: serializeEvent(event)
  });
}

module.exports = {
  getAllEvents,
  getEventById,
  getEventPosterImage,
  getEventThumbnail,
  getEventsByCategory,
  getEventByName,
  getRecommendedEvents,
  createEvent,
  deleteEvent,
  cancelEvent,
  updateEvent
};
