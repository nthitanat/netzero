const { pool } = require('../../config/database');

function mapSurvey(row) {
  return {
    surveyId: row.survey_id,
    name: row.name,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function insert(survey, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO surveys (name, description, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `, [survey.name, survey.description ?? null, survey.startDate ?? null, survey.endDate ?? null]);
  return result.insertId;
}

async function findAll(filters = {}, { tx } = {}) {
  const database = tx || pool;
  let query = 'SELECT * FROM surveys WHERE 1 = 1';
  const values = [];
  if (filters.active) query += ' AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())';
  if (filters.upcoming) query += ' AND start_date > NOW()';
  if (filters.past) query += ' AND end_date < NOW()';
  query += ' ORDER BY created_at DESC';
  if (filters.limit !== undefined) {
    query += ' LIMIT ?';
    values.push(String(filters.limit));
    if (filters.offset !== undefined) {
      query += ' OFFSET ?';
      values.push(String(filters.offset));
    }
  }
  const [rows] = await database.execute(query, values);
  return rows.map(mapSurvey);
}

async function findById(surveyId, { tx, forUpdate = false } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(
    `SELECT * FROM surveys WHERE survey_id = ?${forUpdate ? ' FOR UPDATE' : ''}`,
    [surveyId]
  );
  return rows[0] ? mapSurvey(rows[0]) : null;
}

async function updateById(surveyId, updates, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    UPDATE surveys SET name = ?, description = ?, start_date = ?, end_date = ?,
      updated_at = CURRENT_TIMESTAMP WHERE survey_id = ?
  `, [updates.name, updates.description ?? null, updates.startDate ?? null, updates.endDate ?? null, surveyId]);
  return result.affectedRows > 0;
}

async function deleteById(surveyId, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute('DELETE FROM surveys WHERE survey_id = ?', [surveyId]);
  return result.affectedRows > 0;
}

module.exports = { insert, findAll, findById, updateById, deleteById };
