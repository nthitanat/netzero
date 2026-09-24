const { v4: createUuid } = require('uuid');
const { pool } = require('../config/database');

function mapQuestion(row) {
  return {
    id: row.id,
    questionId: row.question_id,
    questionText: row.question_text,
    scoringCriteria: row.scoring_criteria,
    weight: row.weight,
    isActive: Boolean(row.is_active),
    criterionCode: row.criterion_code,
    criterionNameTh: row.criterion_name_th,
    standardReference: row.standard_reference,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parseJson(value) {
  if (!value || typeof value === 'object') return value ?? null;
  try { return JSON.parse(value); } catch { return value; }
}

function mapResponse(row) {
  return {
    surveyResponseId: row.id,
    productId: row.product_id,
    status: row.status,
    alignmentLevel: row.alignment_level,
    overallScore: row.overall_score,
    aiComment: row.ai_comment,
    aiRawResult: parseJson(row.ai_raw_result),
    criteriaBreakdown: parseJson(row.criteria_breakdown),
    trialCount: row.trial_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAnswer(row) {
  return {
    answerId: row.id,
    surveyResponseId: row.survey_response_id,
    questionId: row.question_id,
    score: row.score,
    comment: row.comment,
    questionText: row.question_text,
    weight: row.weight,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findActiveQuestions({ tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT * FROM products_survey_question WHERE is_active = TRUE
    ORDER BY display_order ASC, created_at ASC
  `);
  return rows.map(mapQuestion);
}

async function findQuestionsByCodes(questionIds, { tx } = {}) {
  if (questionIds.length === 0) return [];
  const database = tx || pool;
  const placeholders = questionIds.map(() => '?').join(', ');
  const [rows] = await database.execute(`
    SELECT * FROM products_survey_question
    WHERE question_id IN (${placeholders})
  `, questionIds);
  return rows.map(mapQuestion);
}

async function findProductForUpdate(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute('SELECT id FROM products WHERE id = ? FOR UPDATE', [productId]);
  return rows[0] ? { productId: rows[0].id } : null;
}

async function getLatestTrialCount(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT MAX(trial_count) AS max_trial FROM products_survey_response
    WHERE product_id = ?
  `, [productId]);
  return rows[0]?.max_trial || 0;
}

async function insertResponse(response, { tx } = {}) {
  const database = tx || pool;
  const surveyResponseId = createUuid();
  await database.execute(`
    INSERT INTO products_survey_response
      (id, product_id, status, trial_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `, [surveyResponseId, response.productId, response.status, response.trialCount]);
  return surveyResponseId;
}

async function findResponseById(surveyResponseId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT * FROM products_survey_response WHERE id = ?
  `, [surveyResponseId]);
  return rows[0] ? mapResponse(rows[0]) : null;
}

async function findResponsesByProductId(productId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT * FROM products_survey_response WHERE product_id = ?
    ORDER BY created_at DESC
  `, [productId]);
  return rows.map(mapResponse);
}

async function updateResponseById(surveyResponseId, updates, { tx } = {}) {
  const database = tx || pool;
  const columnByProperty = {
    status: 'status',
    alignmentLevel: 'alignment_level',
    overallScore: 'overall_score',
    aiComment: 'ai_comment',
    aiRawResult: 'ai_raw_result',
    criteriaBreakdown: 'criteria_breakdown'
  };
  const fields = Object.entries(updates).filter(([property]) => columnByProperty[property]);
  if (fields.length === 0) return findResponseById(surveyResponseId, { tx });
  const assignments = fields.map(([property]) => `${columnByProperty[property]} = ?`).join(', ');
  const values = fields.map(([property, value]) =>
    property === 'aiRawResult' || property === 'criteriaBreakdown'
      ? (value == null ? null : JSON.stringify(value))
      : value
  );
  await database.execute(`
    UPDATE products_survey_response SET ${assignments}, updated_at = NOW()
    WHERE id = ?
  `, [...values, surveyResponseId]);
  return findResponseById(surveyResponseId, { tx });
}

async function insertAnswers(answers, { tx } = {}) {
  if (answers.length === 0) return;
  const database = tx || pool;
  const placeholders = answers.map(() => '(?, ?, ?, ?, ?, NOW(), NOW())').join(', ');
  const values = answers.flatMap(answer => [
    createUuid(),
    answer.surveyResponseId,
    answer.questionId,
    answer.score,
    answer.comment ?? null
  ]);
  await database.execute(`
    INSERT INTO products_survey_answer
      (id, survey_response_id, question_id, score, comment, created_at, updated_at)
    VALUES ${placeholders}
  `, values);
}

async function findAnswersByResponseId(surveyResponseId, { tx } = {}) {
  const database = tx || pool;
  const [rows] = await database.execute(`
    SELECT a.*, q.question_text, q.weight FROM products_survey_answer a
    LEFT JOIN products_survey_question q ON a.question_id = q.id
    WHERE a.survey_response_id = ? ORDER BY a.created_at ASC
  `, [surveyResponseId]);
  return rows.map(mapAnswer);
}

module.exports = {
  findActiveQuestions,
  findQuestionsByCodes,
  findProductForUpdate,
  getLatestTrialCount,
  insertResponse,
  findResponseById,
  findResponsesByProductId,
  updateResponseById,
  insertAnswers,
  findAnswersByResponseId
};
