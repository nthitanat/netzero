const { pool } = require('../config/database');

const EVENT_COLUMNS = `
  id, title, description, event_date, location, category, organizer,
  contact_email, contact_phone, max_participants, current_participants,
  registration_deadline, status, created_at, updated_at, isRecommended
`;
const UPDATE_COLUMNS = Object.freeze({
  title: 'title',
  description: 'description',
  eventDate: 'event_date',
  location: 'location',
  category: 'category',
  organizer: 'organizer',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  maxParticipants: 'max_participants',
  registrationDeadline: 'registration_deadline',
  status: 'status'
});

function formatDateTime(value) {
  if (value === null) return null;
  return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
}

function mapEvent(row) {
  return {
    eventId: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    location: row.location,
    category: row.category,
    organizer: row.organizer,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    maxParticipants: row.max_participants,
    currentParticipants: row.current_participants ?? 0,
    registrationDeadline: row.registration_deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isRecommended: Boolean(row.isRecommended)
  };
}

async function findAll({ limit, offset } = {}, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${EVENT_COLUMNS} FROM events ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [String(limit), String(offset)]
  );
  return rows.map(mapEvent);
}

async function findById(eventId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`, [eventId]
  );
  return rows[0] ? mapEvent(rows[0]) : null;
}

async function findByCategory(category, { limit, offset } = {}, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${EVENT_COLUMNS} FROM events WHERE category = ? AND status = 'active'
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [category, String(limit), String(offset)]);
  return rows.map(mapEvent);
}

async function findByName(name, { limit, offset } = {}, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${EVENT_COLUMNS} FROM events WHERE title LIKE ? AND status = 'active'
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [`%${name}%`, String(limit), String(offset)]);
  return rows.map(mapEvent);
}

async function findRecommended({ limit, offset } = {}, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${EVENT_COLUMNS} FROM events WHERE isRecommended = 1 AND status = 'active'
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [String(limit), String(offset)]);
  return rows.map(mapEvent);
}

async function insert(event, { tx }) {
  const [result] = await tx.execute(`
    INSERT INTO events (
      title, description, event_date, location, category, organizer,
      contact_email, contact_phone, max_participants, registration_deadline,
      status, isRecommended
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    event.title,
    event.description ?? null,
    formatDateTime(event.eventDate),
    event.location ?? null,
    event.category ?? null,
    event.organizer ?? null,
    event.contactEmail ?? null,
    event.contactPhone ?? null,
    event.maxParticipants ?? 0,
    formatDateTime(event.registrationDeadline ?? null),
    event.status,
    event.isRecommended ? 1 : 0
  ]);
  return result.insertId;
}

async function updateByIdOwned({ eventId, actorId, updates }, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `e.${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([name, value]) =>
    name === 'eventDate' || name === 'registrationDeadline' ? formatDateTime(value) : value
  );
  const [result] = await database.execute(`
    UPDATE events e JOIN user_events ue ON ue.event_id = e.id
    SET ${assignments}, e.updated_at = CURRENT_TIMESTAMP
    WHERE e.id = ? AND ue.user_id = ?
  `, [...values, eventId, actorId]);
  return result.affectedRows > 0;
}

async function cancelByIdOwned({ eventId, actorId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE events e JOIN user_events ue ON ue.event_id = e.id
    SET e.status = 'cancelled', e.updated_at = CURRENT_TIMESTAMP
    WHERE e.id = ? AND ue.user_id = ? AND e.status <> 'cancelled'
  `, [eventId, actorId]);
  return result.affectedRows > 0;
}

async function deleteByIdOwned({ eventId, actorId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    DELETE e FROM events e JOIN user_events ue ON ue.event_id = e.id
    WHERE e.id = ? AND ue.user_id = ?
  `, [eventId, actorId]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByCategory,
  findByName,
  findRecommended,
  insert,
  updateByIdOwned,
  cancelByIdOwned,
  deleteByIdOwned
};
