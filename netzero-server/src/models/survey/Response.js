const { executeQuery, executeCommand } = require('../../config/database');

class Response {
  constructor(data) {
    this.response_id = data.response_id;
    this.user_id = data.user_id;
    this.survey_id = data.survey_id;
    this.respondent_id = data.respondent_id;
    this.submitted_at = data.submitted_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition
  static getSchema() {
    return {
      tableName: 'responses',
      columns: {
        response_id: 'INT AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT NULL COMMENT \'Authenticated user who submitted (if logged in)\'',
        survey_id: 'INT NOT NULL',
        respondent_id: 'VARCHAR(255) NULL COMMENT \'Anonymous respondent identifier (session/email/etc)\'',
        submitted_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
        'FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE'
      ],
      indexes: [
        'INDEX idx_responses_user_id (user_id)',
        'INDEX idx_responses_survey_id (survey_id)',
        'INDEX idx_responses_respondent_id (respondent_id)',
        'INDEX idx_responses_submitted_at (submitted_at)',
        'INDEX idx_responses_created_at (created_at)'
      ]
    };
  }

  // Create a new response
  static async create(responseData) {
    const {
      user_id = null,
      survey_id,
      respondent_id = null,
      submitted_at = null
    } = responseData;

    const query = `
      INSERT INTO responses (user_id, survey_id, respondent_id, submitted_at)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      user_id,
      survey_id,
      respondent_id,
      submitted_at || new Date()
    ]);

    return result.insertId;
  }

  // Find all responses for a survey
  static async findBySurveyId(survey_id, filters = {}) {
    let query = `
      SELECT r.*, u.firstName, u.lastName, u.email
      FROM responses r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.survey_id = ?
    `;
    const params = [survey_id];

    if (filters.startDate) {
      query += ' AND r.submitted_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND r.submitted_at <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY r.submitted_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new Response(row));
  }

  // Find all responses by a user
  static async findByUserId(user_id, filters = {}) {
    let query = `
      SELECT r.*, s.name as survey_name
      FROM responses r
      LEFT JOIN surveys s ON r.survey_id = s.survey_id
      WHERE r.user_id = ?
    `;
    const params = [user_id];

    query += ' ORDER BY r.submitted_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new Response(row));
  }

  // Find response by ID
  static async findById(response_id) {
    const query = `
      SELECT r.*, u.firstName, u.lastName, u.email, s.name as survey_name
      FROM responses r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN surveys s ON r.survey_id = s.survey_id
      WHERE r.response_id = ?
    `;
    
    const rows = await executeQuery(query, [response_id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Response(rows[0]);
  }

  // Check if user already responded to a survey
  static async hasUserResponded(survey_id, user_id = null, respondent_id = null) {
    let query = 'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?';
    const params = [survey_id];

    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    } else if (respondent_id) {
      query += ' AND respondent_id = ?';
      params.push(respondent_id);
    } else {
      return false;
    }

    const rows = await executeQuery(query, params);
    return rows[0].count > 0;
  }

  // Get response count for a survey
  static async getCountBySurveyId(survey_id) {
    const query = 'SELECT COUNT(*) as count FROM responses WHERE survey_id = ?';
    const rows = await executeQuery(query, [survey_id]);
    return rows[0].count;
  }

  // Delete response
  static async deleteById(response_id) {
    const query = 'DELETE FROM responses WHERE response_id = ?';
    const [result] = await executeCommand(query, [response_id]);

    return result.affectedRows > 0;
  }

  // Delete all responses for a survey
  static async deleteBySurveyId(survey_id) {
    const query = 'DELETE FROM responses WHERE survey_id = ?';
    const [result] = await executeCommand(query, [survey_id]);

    return result.affectedRows;
  }

  // Get response statistics for a survey
  static async getStatsBySurveyId(survey_id) {
    const query = `
      SELECT 
        COUNT(*) as total_responses,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT respondent_id) as unique_respondents,
        MIN(submitted_at) as first_response,
        MAX(submitted_at) as last_response
      FROM responses 
      WHERE survey_id = ?
    `;

    const rows = await executeQuery(query, [survey_id]);
    return rows[0];
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      response_id: this.response_id,
      user_id: this.user_id,
      survey_id: this.survey_id,
      respondent_id: this.respondent_id,
      submitted_at: this.submitted_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
      respondent: this.firstName ? {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
      } : null,
      survey_name: this.survey_name
    };
  }
}

module.exports = Response;
