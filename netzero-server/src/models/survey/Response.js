const { pool } = require('../../config/database');

function mapResponse(row) {
  return {
    responseId: row.response_id,
    userId: row.user_id,
    surveyId: row.survey_id,
    respondentId: row.respondent_id,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    respondent: row.firstName ? {
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email
    } : null,
    surveyName: row.survey_name
  };
}

async function insert(response, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO responses (user_id, survey_id, respondent_id, submitted_at)
    VALUES (?, ?, ?, ?)
  `, [response.userId ?? null, response.surveyId, response.respondentId ?? null, response.submittedAt]);
  return result.insertId;
}

async function findBySurveyId(surveyId, filters = {}, { tx } = {}) {
  const database = tx || pool;
  let query = `
    SELECT r.*, u.firstName, u.lastName, u.email
    FROM responses r LEFT JOIN users u ON r.user_id = u.id
    WHERE r.survey_id = ?
  `;
  const values = [surveyId];
  if (filters.startDate) {
    query += ' AND r.submitted_at >= ?';
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ' AND r.submitted_at <= ?';
    values.push(filters.endDate);
  }
  query += ' ORDER BY r.submitted_at DESC';
  if (filters.limit !== undefined) {
    query += ' LIMIT ?';
    values.push(String(filters.limit));
    if (filters.offset !== undefined) {
      query += ' OFFSET ?';
      values.push(String(filters.offset));
    }
  }
  const [rows] = await database.execute(query, values);
  return rows.map(mapResponse);
}

async function findById(responseId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT r.*, u.firstName, u.lastName, u.email, s.name AS survey_name
    FROM responses r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN surveys s ON r.survey_id = s.survey_id
    WHERE r.response_id = ?
  `, [responseId]);
  return rows[0] ? mapResponse(rows[0]) : null;
}

async function hasResponded({ surveyId, userId, respondentId }, { tx } = {}) {
  if (userId == null && !respondentId) return false;
  const database = tx || pool;
  const field = userId != null ? 'user_id' : 'respondent_id';
  const value = userId != null ? userId : respondentId;
  const [rows] = await database.execute(
    `SELECT COUNT(*) AS count FROM responses WHERE survey_id = ? AND ${field} = ?`,
    [surveyId, value]
  );
  return rows[0].count > 0;
}

async function getStatsBySurveyId(surveyId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT COUNT(*) AS total_responses,
      COUNT(DISTINCT user_id) AS unique_users,
      COUNT(DISTINCT respondent_id) AS unique_respondents,
      MIN(submitted_at) AS first_response,
      MAX(submitted_at) AS last_response
    FROM responses WHERE survey_id = ?
  `, [surveyId]);
  const row = rows[0];
  return {
    totalResponses: row.total_responses,
    uniqueUsers: row.unique_users,
    uniqueRespondents: row.unique_respondents,
    firstResponse: row.first_response,
    lastResponse: row.last_response
  };
}

module.exports = { insert, findBySurveyId, findById, hasResponded, getStatsBySurveyId };
