const { pool } = require('../../config/database');

function mapQuestion(row) {
  return {
    questionId: row.question_id,
    surveyId: row.survey_id,
    questionText: row.question_text,
    questionType: row.question_type,
    orderInSurvey: row.order_in_survey,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function insert(question, { tx } = {}) {
  const database = tx || pool;
  const [result] = await database.execute(`
    INSERT INTO questions (survey_id, question_text, question_type, order_in_survey)
    VALUES (?, ?, ?, ?)
  `, [question.surveyId, question.questionText, question.questionType, question.orderInSurvey]);
  return result.insertId;
}

async function findBySurveyId(surveyId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT * FROM questions WHERE survey_id = ?
    ORDER BY order_in_survey ASC, question_id ASC
  `, [surveyId]);
  return rows.map(mapQuestion);
}

async function findById(questionId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute('SELECT * FROM questions WHERE question_id = ?', [questionId]);
  return rows[0] ? mapQuestion(rows[0]) : null;
}

module.exports = { insert, findBySurveyId, findById };
