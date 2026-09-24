const { pool } = require('../config/database');

const CHECKIN_COLUMNS = `
  id, survey_id, identifier_type, identifier_value,
  surveymonkey_response_id, status, checked_in_at,
  completed_at, last_synced_at, created_at, updated_at
`;
const UPDATE_COLUMNS = Object.freeze({
  status: 'status',
  surveyMonkeyResponseId: 'surveymonkey_response_id',
  completedAt: 'completed_at',
  lastSyncedAt: 'last_synced_at'
});

function mapCheckin(row) {
  return {
    checkinId: row.id,
    surveyId: row.survey_id,
    identifierType: row.identifier_type,
    identifierValue: row.identifier_value,
    surveyMonkeyResponseId: row.surveymonkey_response_id,
    status: row.status,
    checkedInAt: row.checked_in_at,
    completedAt: row.completed_at,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function insert(checkin, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO glocal_checkins (
      survey_id, identifier_type, identifier_value, surveymonkey_response_id,
      status, completed_at, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    checkin.surveyId,
    checkin.identifierType,
    checkin.identifierValue,
    checkin.surveyMonkeyResponseId ?? null,
    checkin.status,
    checkin.completedAt ?? null,
    checkin.lastSyncedAt ?? null
  ]);
  return result.insertId;
}

async function upsert(checkin, { tx } = {}) {
  const database = tx || pool;
  await database.execute(`
    INSERT INTO glocal_checkins (
      survey_id, identifier_type, identifier_value, surveymonkey_response_id,
      status, completed_at, last_synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      surveymonkey_response_id = VALUES(surveymonkey_response_id),
      status = VALUES(status),
      completed_at = COALESCE(VALUES(completed_at), completed_at),
      last_synced_at = VALUES(last_synced_at),
      updated_at = CURRENT_TIMESTAMP
  `, [
    checkin.surveyId,
    checkin.identifierType,
    checkin.identifierValue,
    checkin.surveyMonkeyResponseId ?? null,
    checkin.status,
    checkin.completedAt ?? null,
    checkin.lastSyncedAt ?? null
  ]);
  return findByIdentifier({
    surveyId: checkin.surveyId,
    identifierValue: checkin.identifierValue,
    identifierType: checkin.identifierType
  }, { tx });
}

async function findById(checkinId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT ${CHECKIN_COLUMNS} FROM glocal_checkins WHERE id = ?`,
    [checkinId]
  );
  return rows[0] ? mapCheckin(rows[0]) : null;
}

async function findByIdentifier({ surveyId, identifierValue, identifierType = 'email' }, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT ${CHECKIN_COLUMNS} FROM glocal_checkins
    WHERE survey_id = ? AND identifier_type = ? AND identifier_value = ?
  `, [surveyId, identifierType, identifierValue]);
  return rows[0] ? mapCheckin(rows[0]) : null;
}

function buildFilterQuery(filters) {
  let clause = ' WHERE 1 = 1';
  const values = [];
  if (filters.surveyId !== undefined) {
    clause += ' AND survey_id = ?';
    values.push(filters.surveyId);
  }
  if (filters.status !== undefined) {
    clause += ' AND status = ?';
    values.push(filters.status);
  }
  return { clause, values };
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  const { clause, values } = buildFilterQuery(filters);
  const [rows] = await database.execute(`
    SELECT ${CHECKIN_COLUMNS} FROM glocal_checkins ${clause}
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [...values, String(filters.limit), String(filters.offset)]);
  return rows.map(mapCheckin);
}

async function count(filters = {}, { tx } = {}) {
  const database = tx || pool;
  const { clause, values } = buildFilterQuery(filters);
  const [rows] = await database.execute(
    `SELECT COUNT(*) AS total FROM glocal_checkins ${clause}`,
    values
  );
  return rows[0].total;
}

async function updateById(checkinId, updates, { tx } = {}) {
  const database = tx || pool;
  const fields = Object.entries(updates).filter(([name]) => UPDATE_COLUMNS[name]);
  if (fields.length === 0) return false;
  const assignments = fields.map(([name]) => `${UPDATE_COLUMNS[name]} = ?`).join(', ');
  const values = fields.map(([, value]) => value);
  const [result] = await database.execute(`
    UPDATE glocal_checkins SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [...values, checkinId]);
  return result.affectedRows > 0;
}

async function deleteById(checkinId, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute('DELETE FROM glocal_checkins WHERE id = ?', [checkinId]);
  return result.affectedRows > 0;
}

module.exports = {
  insert,
  upsert,
  findById,
  findByIdentifier,
  findAll,
  count,
  updateById,
  deleteById
};
