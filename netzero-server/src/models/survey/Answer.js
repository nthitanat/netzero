const { executeQuery, executeCommand } = require('../../config/database');
const { ensureModelTable } = require('../../utils/databaseEnsure');

class Answer {
  constructor(data) {
    this.answer_id = data.answer_id;
    this.response_id = data.response_id;
    this.question_id = data.question_id;
    this.answer_text = data.answer_text;
    this.answer_choice_id = data.answer_choice_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition
  static getSchema() {
    return {
      tableName: 'answers',
      columns: {
        answer_id: 'INT AUTO_INCREMENT PRIMARY KEY',
        response_id: 'INT NOT NULL',
        question_id: 'INT NOT NULL',
        answer_text: 'TEXT NULL COMMENT \'Free text answer for text/open-ended questions\'',
        answer_choice_id: 'INT NULL COMMENT \'Selected choice ID for multiple choice questions\'',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (response_id) REFERENCES responses(response_id) ON DELETE CASCADE',
        'FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE'
      ],
      indexes: [
        'INDEX idx_answers_response_id (response_id)',
        'INDEX idx_answers_question_id (question_id)',
        'INDEX idx_answers_choice_id (answer_choice_id)',
        'INDEX idx_answers_created_at (created_at)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(Answer.getSchema());
  }

  // Create a new answer
  static async create(answerData) {
    await Answer.ensureTable();
    
    const {
      response_id,
      question_id,
      answer_text = null,
      answer_choice_id = null
    } = answerData;

    const query = `
      INSERT INTO answers (response_id, question_id, answer_text, answer_choice_id)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      response_id,
      question_id,
      answer_text,
      answer_choice_id
    ]);

    return result.insertId;
  }

  // Bulk create answers for a response
  static async createBulk(answersData) {
    await Answer.ensureTable();
    
    if (!answersData || answersData.length === 0) {
      return [];
    }

    const values = answersData.map(answer => 
      `(${answer.response_id}, ${answer.question_id}, ${
        answer.answer_text ? `'${answer.answer_text.replace(/'/g, "''")}'` : 'NULL'
      }, ${answer.answer_choice_id || 'NULL'})`
    ).join(', ');

    const query = `
      INSERT INTO answers (response_id, question_id, answer_text, answer_choice_id)
      VALUES ${values}
    `;

    const [result] = await executeCommand(query);
    return result.insertId;
  }

  // Find all answers for a response
  static async findByResponseId(response_id) {
    await Answer.ensureTable();
    
    const query = `
      SELECT a.*, q.question_text, q.question_type
      FROM answers a
      LEFT JOIN questions q ON a.question_id = q.question_id
      WHERE a.response_id = ?
      ORDER BY q.order_in_survey ASC, a.answer_id ASC
    `;

    const rows = await executeQuery(query, [response_id]);
    return rows.map(row => new Answer(row));
  }

  // Find all answers for a question (for aggregating responses)
  static async findByQuestionId(question_id) {
    await Answer.ensureTable();
    
    const query = `
      SELECT a.*, r.user_id, r.respondent_id, r.submitted_at
      FROM answers a
      LEFT JOIN responses r ON a.response_id = r.response_id
      WHERE a.question_id = ?
      ORDER BY r.submitted_at DESC
    `;

    const rows = await executeQuery(query, [question_id]);
    return rows.map(row => new Answer(row));
  }

  // Find answer by ID
  static async findById(answer_id) {
    await Answer.ensureTable();
    
    const query = `
      SELECT a.*, q.question_text, q.question_type
      FROM answers a
      LEFT JOIN questions q ON a.question_id = q.question_id
      WHERE a.answer_id = ?
    `;
    
    const rows = await executeQuery(query, [answer_id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Answer(rows[0]);
  }

  // Update answer
  static async updateById(answer_id, answerData) {
    await Answer.ensureTable();
    
    const {
      answer_text,
      answer_choice_id
    } = answerData;

    const query = `
      UPDATE answers 
      SET answer_text = ?, answer_choice_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE answer_id = ?
    `;

    const [result] = await executeCommand(query, [
      answer_text,
      answer_choice_id,
      answer_id
    ]);

    return result.affectedRows > 0;
  }

  // Delete answer
  static async deleteById(answer_id) {
    await Answer.ensureTable();
    
    const query = 'DELETE FROM answers WHERE answer_id = ?';
    const [result] = await executeCommand(query, [answer_id]);

    return result.affectedRows > 0;
  }

  // Delete all answers for a response
  static async deleteByResponseId(response_id) {
    await Answer.ensureTable();
    
    const query = 'DELETE FROM answers WHERE response_id = ?';
    const [result] = await executeCommand(query, [response_id]);

    return result.affectedRows;
  }

  // Get answer statistics for a question
  static async getStatsByQuestionId(question_id) {
    await Answer.ensureTable();
    
    const query = `
      SELECT 
        COUNT(*) as total_answers,
        COUNT(DISTINCT response_id) as unique_responses,
        COUNT(answer_text) as text_answers,
        COUNT(answer_choice_id) as choice_answers
      FROM answers 
      WHERE question_id = ?
    `;

    const rows = await executeQuery(query, [question_id]);
    return rows[0];
  }

  // Get text answer distribution for a question (for text analysis)
  static async getTextAnswers(question_id, limit = 100) {
    await Answer.ensureTable();
    
    const query = `
      SELECT a.answer_text, r.submitted_at
      FROM answers a
      LEFT JOIN responses r ON a.response_id = r.response_id
      WHERE a.question_id = ? AND a.answer_text IS NOT NULL
      ORDER BY r.submitted_at DESC
      LIMIT ?
    `;

    const rows = await executeQuery(query, [question_id, limit]);
    return rows;
  }

  // Get choice distribution for a multiple choice question
  static async getChoiceDistribution(question_id) {
    await Answer.ensureTable();
    
    const query = `
      SELECT 
        answer_choice_id,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM answers WHERE question_id = ?) as percentage
      FROM answers
      WHERE question_id = ? AND answer_choice_id IS NOT NULL
      GROUP BY answer_choice_id
      ORDER BY count DESC
    `;

    const rows = await executeQuery(query, [question_id, question_id]);
    return rows;
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      answer_id: this.answer_id,
      response_id: this.response_id,
      question_id: this.question_id,
      answer_text: this.answer_text,
      answer_choice_id: this.answer_choice_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      question: this.question_text ? {
        question_text: this.question_text,
        question_type: this.question_type
      } : null
    };
  }
}

module.exports = Answer;
