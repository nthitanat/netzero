const { pool } = require('../../config/database');

function mapAnswer(row) {
  return {
    answerId: row.answer_id,
    responseId: row.response_id,
    questionId: row.question_id,
    answerText: row.answer_text,
    answerChoiceId: row.answer_choice_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    question: row.question_text ? {
      questionText: row.question_text,
      questionType: row.question_type
    } : null
  };
}

async function insertMany(answers, { tx } = {}) {
  if (answers.length === 0) return;
  const database = tx || pool;
  const placeholders = answers.map(() => '(?, ?, ?, ?)').join(', ');
  const values = answers.flatMap(answer => [
    answer.responseId,
    answer.questionId,
    answer.answerText ?? null,
    answer.answerChoiceId ?? null
  ]);
  await database.execute(`
    INSERT INTO answers (response_id, question_id, answer_text, answer_choice_id)
    VALUES ${placeholders}
  `, values);
}

async function findByResponseId(responseId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT a.*, q.question_text, q.question_type FROM answers a
    LEFT JOIN questions q ON a.question_id = q.question_id
    WHERE a.response_id = ? ORDER BY q.order_in_survey ASC, a.answer_id ASC
  `, [responseId]);
  return rows.map(mapAnswer);
}

async function getStatsByQuestionId(questionId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT COUNT(*) AS total_answers,
      COUNT(DISTINCT response_id) AS unique_responses,
      COUNT(answer_text) AS text_answers,
      COUNT(answer_choice_id) AS choice_answers
    FROM answers WHERE question_id = ?
  `, [questionId]);
  const row = rows[0];
  return {
    totalAnswers: row.total_answers,
    uniqueResponses: row.unique_responses,
    textAnswers: row.text_answers,
    choiceAnswers: row.choice_answers
  };
}

async function getTextAnswers(questionId, limit, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT a.answer_text, r.submitted_at FROM answers a
    LEFT JOIN responses r ON a.response_id = r.response_id
    WHERE a.question_id = ? AND a.answer_text IS NOT NULL
    ORDER BY r.submitted_at DESC LIMIT ?
  `, [questionId, String(limit)]);
  return rows.map(row => ({ answerText: row.answer_text, submittedAt: row.submitted_at }));
}

async function getChoiceDistribution(questionId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT answer_choice_id, COUNT(*) AS count,
      COUNT(*) * 100.0 / (SELECT COUNT(*) FROM answers WHERE question_id = ?) AS percentage
    FROM answers WHERE question_id = ? AND answer_choice_id IS NOT NULL
    GROUP BY answer_choice_id ORDER BY count DESC
  `, [questionId, questionId]);
  return rows.map(row => ({ answerChoiceId: row.answer_choice_id, count: row.count, percentage: row.percentage }));
}

module.exports = {
  insertMany,
  findByResponseId,
  getStatsByQuestionId,
  getTextAnswers,
  getChoiceDistribution
};
