const { executeQuery, executeCommand } = require('../config/database');

class GlocalCheckin {
  constructor(data) {
    this.id = data.id;
    this.survey_id = data.survey_id;
    this.identifier_type = data.identifier_type;
    this.identifier_value = data.identifier_value;
    this.surveymonkey_response_id = data.surveymonkey_response_id;
    this.status = data.status;
    this.checked_in_at = data.checked_in_at;
    this.completed_at = data.completed_at;
    this.last_synced_at = data.last_synced_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Database schema definition
  static getSchema() {
    return {
      tableName: 'glocal_checkins',
      columns: {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        survey_id: 'VARCHAR(64) NOT NULL',
        identifier_type: "ENUM('email') NOT NULL DEFAULT 'email'",
        identifier_value: 'VARCHAR(255) NOT NULL',
        surveymonkey_response_id: 'VARCHAR(64) NULL',
        status: "ENUM('not_started','partial','completed') NOT NULL DEFAULT 'not_started'",
        checked_in_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        completed_at: 'TIMESTAMP NULL DEFAULT NULL',
        last_synced_at: 'TIMESTAMP NULL DEFAULT NULL',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      indexes: [
        'UNIQUE INDEX uq_glocal_checkins_survey_identifier (survey_id, identifier_type, identifier_value)',
        'INDEX idx_glocal_checkins_status (status)'
      ]
    };
  }

  static async create(data) {
    const {
      survey_id,
      identifier_type = 'email',
      identifier_value,
      surveymonkey_response_id = null,
      status = 'not_started',
      completed_at = null,
      last_synced_at = null
    } = data;

    const query = `
      INSERT INTO glocal_checkins
        (survey_id, identifier_type, identifier_value, surveymonkey_response_id, status, completed_at, last_synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await executeCommand(query, [
      survey_id, identifier_type, identifier_value, surveymonkey_response_id, status, completed_at, last_synced_at
    ]);

    return result.insertId;
  }

  // Insert or update a check-in row keyed on (survey_id, identifier_type, identifier_value)
  static async upsert(data) {
    const {
      survey_id,
      identifier_type = 'email',
      identifier_value,
      surveymonkey_response_id = null,
      status = 'not_started',
      completed_at = null,
      last_synced_at = null
    } = data;

    const query = `
      INSERT INTO glocal_checkins
        (survey_id, identifier_type, identifier_value, surveymonkey_response_id, status, completed_at, last_synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        surveymonkey_response_id = VALUES(surveymonkey_response_id),
        status = VALUES(status),
        completed_at = COALESCE(VALUES(completed_at), completed_at),
        last_synced_at = VALUES(last_synced_at),
        updated_at = CURRENT_TIMESTAMP
    `;

    await executeCommand(query, [
      survey_id, identifier_type, identifier_value, surveymonkey_response_id, status, completed_at, last_synced_at
    ]);

    return GlocalCheckin.findByIdentifier(survey_id, identifier_value, identifier_type);
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM glocal_checkins WHERE 1=1';
    const params = [];

    if (filters.survey_id) {
      query += ' AND survey_id = ?';
      params.push(filters.survey_id);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
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
    return rows.map(row => new GlocalCheckin(row));
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM glocal_checkins WHERE 1=1';
    const params = [];

    if (filters.survey_id) {
      query += ' AND survey_id = ?';
      params.push(filters.survey_id);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const rows = await executeQuery(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const rows = await executeQuery('SELECT * FROM glocal_checkins WHERE id = ?', [id]);
    return rows.length ? new GlocalCheckin(rows[0]) : null;
  }

  static async findByIdentifier(survey_id, identifier_value, identifier_type = 'email') {
    const rows = await executeQuery(
      'SELECT * FROM glocal_checkins WHERE survey_id = ? AND identifier_type = ? AND identifier_value = ?',
      [survey_id, identifier_type, identifier_value]
    );
    return rows.length ? new GlocalCheckin(rows[0]) : null;
  }

  static async updateById(id, updates) {
    const allowedFields = ['status', 'surveymonkey_response_id', 'completed_at', 'last_synced_at'];
    const fields = [];
    const params = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    params.push(id);
    const query = `UPDATE glocal_checkins SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await executeCommand(query, params);
    return result.affectedRows > 0;
  }

  static async deleteById(id) {
    const [result] = await executeCommand('DELETE FROM glocal_checkins WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = GlocalCheckin;
