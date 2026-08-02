const { executeQuery, executeCommand } = require('../../config/database');

class Survey {
  constructor(data) {
    this.survey_id = data.survey_id;
    this.name = data.name;
    this.description = data.description;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition
  static getSchema() {
    return {
      tableName: 'surveys',
      columns: {
        survey_id: 'INT AUTO_INCREMENT PRIMARY KEY',
        name: 'VARCHAR(255) NOT NULL',
        description: 'TEXT NULL',
        start_date: 'DATETIME NULL',
        end_date: 'DATETIME NULL',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      indexes: [
        'INDEX idx_surveys_name (name)',
        'INDEX idx_surveys_start_date (start_date)',
        'INDEX idx_surveys_end_date (end_date)',
        'INDEX idx_surveys_created_at (created_at)'
      ]
    };
  }

  // Create a new survey
  static async create(surveyData) {
    const {
      name,
      description = null,
      start_date = null,
      end_date = null
    } = surveyData;

    const query = `
      INSERT INTO surveys (name, description, start_date, end_date)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      name,
      description,
      start_date,
      end_date
    ]);

    return result.insertId;
  }

  // Find all surveys with optional filters
  static async findAll(filters = {}) {
    let query = `SELECT * FROM surveys WHERE 1=1`;
    const params = [];

    if (filters.active) {
      query += ' AND (start_date IS NULL OR start_date <= NOW())';
      query += ' AND (end_date IS NULL OR end_date >= NOW())';
    }

    if (filters.upcoming) {
      query += ' AND start_date > NOW()';
    }

    if (filters.past) {
      query += ' AND end_date < NOW()';
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const rows = await executeQuery(query, params);
    return rows.map(row => new Survey(row));
  }

  // Find survey by ID
  static async findById(survey_id) {
    const query = `SELECT * FROM surveys WHERE survey_id = ?`;
    const rows = await executeQuery(query, [survey_id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Survey(rows[0]);
  }

  // Update survey
  static async updateById(survey_id, surveyData) {
    const {
      name,
      description,
      start_date,
      end_date
    } = surveyData;

    const query = `
      UPDATE surveys 
      SET name = ?, description = ?, start_date = ?, end_date = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE survey_id = ?
    `;

    const [result] = await executeCommand(query, [
      name,
      description,
      start_date,
      end_date,
      survey_id
    ]);

    return result.affectedRows > 0;
  }

  // Delete survey
  static async deleteById(survey_id) {
    const query = 'DELETE FROM surveys WHERE survey_id = ?';
    const [result] = await executeCommand(query, [survey_id]);

    return result.affectedRows > 0;
  }

  // Check if survey is currently active
  static async isActive(survey_id) {
    const survey = await Survey.findById(survey_id);
    
    if (!survey) {
      return false;
    }

    const now = new Date();
    const startDate = survey.start_date ? new Date(survey.start_date) : null;
    const endDate = survey.end_date ? new Date(survey.end_date) : null;

    const afterStart = !startDate || startDate <= now;
    const beforeEnd = !endDate || endDate >= now;

    return afterStart && beforeEnd;
  }

  // Get total count
  static async getTotalCount() {
    const query = 'SELECT COUNT(*) as count FROM surveys';
    const rows = await executeQuery(query);
    return rows[0].count;
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      survey_id: this.survey_id,
      name: this.name,
      description: this.description,
      start_date: this.start_date,
      end_date: this.end_date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Survey;
