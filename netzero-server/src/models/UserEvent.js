const { pool } = require('../config/database');

async function insert({ userId, eventId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(
    'INSERT INTO user_events (user_id, event_id) VALUES (?, ?)',
    [userId, eventId]
  );
  return result.insertId;
}

async function listEventsByUserId(userId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT e.id, e.title, e.description, e.event_date, e.location,
      e.status, e.created_at, ue.joined_at
    FROM user_events ue JOIN events e ON ue.event_id = e.id
    WHERE ue.user_id = ? ORDER BY e.event_date DESC
  `, [userId]);
  return rows.map(row => ({
    eventId: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    location: row.location,
    status: row.status,
    createdAt: row.created_at,
    joinedAt: row.joined_at
  }));
}

async function listUsersByEventId(eventId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT u.id, u.firstName, u.lastName, u.email, ue.joined_at
    FROM user_events ue JOIN users u ON ue.user_id = u.id
    WHERE ue.event_id = ? AND u.isActive = TRUE ORDER BY ue.joined_at DESC
  `, [eventId]);
  return rows.map(row => ({
    userId: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    joinedAt: row.joined_at
  }));
}

async function hasAssociation({ userId, eventId }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    'SELECT id FROM user_events WHERE user_id = ? AND event_id = ? LIMIT 1',
    [userId, eventId]
  );
  return rows.length > 0;
}

async function remove({ userId, eventId }, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(
    'DELETE FROM user_events WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  insert,
  listEventsByUserId,
  listUsersByEventId,
  hasAssociation,
  remove
};
