const UserEventService = require('../services/UserEventService');
const { sendSuccess } = require('../middleware/response');

function serializeUserEvent(event) {
  return {
    id: event.eventId,
    title: event.title,
    description: event.description,
    event_date: event.eventDate,
    location: event.location,
    status: event.status,
    created_at: event.createdAt,
    joined_at: event.joinedAt
  };
}

function serializeEventUser(user) {
  return {
    id: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    joined_at: user.joinedAt
  };
}

async function getUserEvents(req, res) {
  const events = await UserEventService.getUserEvents({ userId: req.validated.params.userId });
  return sendSuccess(res, {
    message: 'User events retrieved successfully',
    data: events.map(serializeUserEvent)
  });
}

async function getMyEvents(req, res) {
  const events = await UserEventService.getMyEvents({ actor: req.user });
  return sendSuccess(res, {
    message: 'My events retrieved successfully',
    data: events.map(serializeUserEvent)
  });
}

async function joinEvent(req, res) {
  const { userId, eventId } = req.validated.body;
  const userEventId = await UserEventService.joinEvent({ actor: req.user, userId, eventId });
  return sendSuccess(res, {
    message: 'User joined event successfully',
    data: { id: userEventId },
    statusCode: 201
  });
}

async function leaveEvent(req, res) {
  const { userId, eventId } = req.validated.params;
  await UserEventService.leaveEvent({ actor: req.user, userId, eventId });
  return sendSuccess(res, { message: 'User left event successfully' });
}

async function getEventUsers(req, res) {
  const users = await UserEventService.getEventUsers({ eventId: req.validated.params.eventId });
  return sendSuccess(res, {
    message: 'Event users retrieved successfully',
    data: users.map(serializeEventUser)
  });
}

async function checkOwnership(req, res) {
  const { userId, eventId } = req.validated.params;
  const ownsEvent = await UserEventService.checkOwnership({ userId, eventId });
  return sendSuccess(res, {
    message: 'Ownership check completed',
    data: { ownsEvent }
  });
}

module.exports = {
  getUserEvents,
  getMyEvents,
  joinEvent,
  leaveEvent,
  getEventUsers,
  checkOwnership
};
