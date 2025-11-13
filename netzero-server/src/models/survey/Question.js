const { executeQuery, executeCommand } = require('../../config/database');
const { ensureModelTable } = require('../../utils/databaseEnsure');

class Question {
  constructor(data) {
    this.question_id = data.question_id;
    this.survey_id = data.survey_id;
    this.question_text = data.question_text;
    this.question_type = data.question_type;
    this.order_in_survey = data.order_in_survey;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition
  static getSchema() {
    return {
      tableName: 'questions',
      columns: {
        question_id: 'INT AUTO_INCREMENT PRIMARY KEY',
        survey_id: 'INT NOT NULL',
        question_text: 'TEXT NOT NULL',
        question_type: "ENUM('text', 'multiple_choice', 'yes_no', 'rating', 'checkbox') DEFAULT 'text'",
        order_in_survey: 'INT NULL',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE'
      ],
      indexes: [
        'INDEX idx_questions_survey_id (survey_id)',
        'INDEX idx_questions_order (order_in_survey)',
        'INDEX idx_questions_type (question_type)',
        'INDEX idx_questions_created_at (created_at)'
      ]
    };
  }

  // Ensure table exists before any operations
  static async ensureTable() {
    return await ensureModelTable(Question.getSchema());
  }

  // Create a new question
  static async create(questionData) {
    await Question.ensureTable();
    
    const {
      survey_id,
      question_text,
      question_type = 'text',
      order_in_survey = null
    } = questionData;

    const query = `
      INSERT INTO questions (survey_id, question_text, question_type, order_in_survey)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      survey_id,
      question_text,
      question_type,
      order_in_survey
    ]);

    return result.insertId;
  }

  // Find all questions for a survey
  static async findBySurveyId(survey_id) {
    await Question.ensureTable();
    
    const query = `
      SELECT * FROM questions 
      WHERE survey_id = ?
      ORDER BY order_in_survey ASC, question_id ASC
    `;

    const rows = await executeQuery(query, [survey_id]);
    return rows.map(row => new Question(row));
  }

  // Find question by ID
  static async findById(question_id) {
    await Question.ensureTable();
    
    const query = `SELECT * FROM questions WHERE question_id = ?`;
    const rows = await executeQuery(query, [question_id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Question(rows[0]);
  }

  // Update question
  static async updateById(question_id, questionData) {
    await Question.ensureTable();
    
    const {
      question_text,
      question_type,
      order_in_survey
    } = questionData;

    const query = `
      UPDATE questions 
      SET question_text = ?, question_type = ?, order_in_survey = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE question_id = ?
    `;

    const [result] = await executeCommand(query, [
      question_text,
      question_type,
      order_in_survey,
      question_id
    ]);

    return result.affectedRows > 0;
  }

  // Delete question
  static async deleteById(question_id) {
    await Question.ensureTable();
    
    const query = 'DELETE FROM questions WHERE question_id = ?';
    const [result] = await executeCommand(query, [question_id]);

    return result.affectedRows > 0;
  }

  // Delete all questions for a survey
  static async deleteBySurveyId(survey_id) {
    await Question.ensureTable();
    
    const query = 'DELETE FROM questions WHERE survey_id = ?';
    const [result] = await executeCommand(query, [survey_id]);

    return result.affectedRows;
  }

  // Reorder questions in a survey
  static async reorderQuestions(survey_id, questionOrder) {
    await Question.ensureTable();
    
    // questionOrder should be an array of { question_id, order_in_survey }
    const promises = questionOrder.map(({ question_id, order_in_survey }) => {
      const query = `
        UPDATE questions 
        SET order_in_survey = ?, updated_at = CURRENT_TIMESTAMP
        WHERE question_id = ? AND survey_id = ?
      `;
      return executeCommand(query, [order_in_survey, question_id, survey_id]);
    });

    await Promise.all(promises);
    return true;
  }

  // Get count of questions in a survey
  static async getCountBySurveyId(survey_id) {
    await Question.ensureTable();
    
    const query = 'SELECT COUNT(*) as count FROM questions WHERE survey_id = ?';
    const rows = await executeQuery(query, [survey_id]);
    return rows[0].count;
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      question_id: this.question_id,
      survey_id: this.survey_id,
      question_text: this.question_text,
      question_type: this.question_type,
      order_in_survey: this.order_in_survey,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Question;
