const { executeQuery, getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * ProductSurvey Model
 * Consolidated model for product survey questions, responses, and answers
 * Follows the netzero-server base model architecture
 */

// ============================================================================
// PRODUCT SURVEY QUESTION MODEL
// ============================================================================

class ProductSurveyQuestion {
  constructor(data) {
    this.id = data.id;
    this.question_id = data.question_id;
    this.question_text = data.question_text;
    this.scoring_criteria = data.scoring_criteria;
    this.weight = data.weight;
    this.is_active = data.is_active;
    this.criterion_code = data.criterion_code;
    this.criterion_name_th = data.criterion_name_th;
    this.standard_reference = data.standard_reference;
    this.display_order = data.display_order;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Get database schema for ProductSurveyQuestion table
   */
  static getSchema() {
    return {
      tableName: 'products_survey_question',
      columns: {
        id: 'VARCHAR(36) PRIMARY KEY',
        question_id: 'VARCHAR(50) UNIQUE NOT NULL',
        question_text: 'TEXT NOT NULL',
        scoring_criteria: 'TEXT',
        weight: 'DECIMAL(3,2) DEFAULT 1.00',
        is_active: 'BOOLEAN DEFAULT TRUE',
        criterion_code: 'VARCHAR(20) NULL',
        criterion_name_th: 'VARCHAR(255) NULL',
        standard_reference: 'VARCHAR(50) NULL',
        display_order: 'INT DEFAULT 999',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [],
      indexes: [
        'INDEX idx_question_is_active (is_active)',
        'INDEX idx_question_created_at (created_at)',
        'INDEX idx_criterion_code (criterion_code)',
        'INDEX idx_display_order (display_order)',
        'UNIQUE INDEX idx_question_id (question_id)'
      ]
    };
  }

  /**
   * Get all active survey questions
   * @returns {Promise<Array<ProductSurveyQuestion>>}
   */
  static async findAllActive() {
    const query = `
      SELECT 
        id, question_id, question_text, scoring_criteria, weight, is_active,
        criterion_code, criterion_name_th, standard_reference, display_order,
        created_at, updated_at
      FROM products_survey_question
      WHERE is_active = true
      ORDER BY display_order ASC, created_at ASC
    `;
    
    const rows = await executeQuery(query);
    return rows.map(row => new ProductSurveyQuestion(row));
  }

  /**
   * Find question by ID
   * @param {string} id
   * @returns {Promise<ProductSurveyQuestion|null>}
   */
  static async findById(id) {
    const query = `
      SELECT id, question_text, weight, is_active, created_at, updated_at
      FROM products_survey_question
      WHERE id = ?
    `;
    
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new ProductSurveyQuestion(rows[0]) : null;
  }

  /**
   * Find multiple questions by IDs
   * @param {Array<string>} ids
   * @returns {Promise<Array<ProductSurveyQuestion>>}
   */
  static async findByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => '?').join(',');
    const query = `
      SELECT id, question_id, question_text, scoring_criteria, weight, is_active,
             criterion_code, criterion_name_th, standard_reference, display_order,
             created_at, updated_at
      FROM products_survey_question
      WHERE question_id IN (${placeholders})
    `;
    
    const rows = await executeQuery(query, ids);
    return rows.map(row => new ProductSurveyQuestion(row));
  }

  /**
   * Create a new survey question
   * @param {Object} questionData
   * @returns {Promise<ProductSurveyQuestion>}
   */
  static async create(questionData) {
    const id = uuidv4();
    const { question_text, weight = 1.0, is_active = true } = questionData;
    
    const query = `
      INSERT INTO products_survey_question (
        id, question_text, weight, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    await executeQuery(query, [id, question_text, weight, is_active ? 1 : 0]);
    return await ProductSurveyQuestion.findById(id);
  }

  /**
   * Update a survey question
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<ProductSurveyQuestion|null>}
   */
  static async updateById(id, updateData) {
    const { question_text, weight, is_active } = updateData;
    
    const updates = [];
    const values = [];
    
    if (question_text !== undefined) {
      updates.push('question_text = ?');
      values.push(question_text);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(weight);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return await ProductSurveyQuestion.findById(id);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `
      UPDATE products_survey_question
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, values);
    return await ProductSurveyQuestion.findById(id);
  }

  /**
   * Delete (deactivate) a survey question
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  static async deleteById(id) {
    const query = `
      UPDATE products_survey_question
      SET is_active = false, updated_at = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(query, [id]);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      question_text: this.question_text,
      weight: this.weight,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// ============================================================================
// PRODUCT SURVEY RESPONSE MODEL
// ============================================================================

class ProductSurveyResponse {
  constructor(data) {
    this.id = data.id;
    this.product_id = data.product_id;
    this.status = data.status;
    this.alignment_level = data.alignment_level;
    this.overall_score = data.overall_score;
    this.ai_comment = data.ai_comment;
    this.ai_raw_result = this._parseRawResult(data.ai_raw_result);
    this.criteria_breakdown = this._parseRawResult(data.criteria_breakdown);
    this.trial_count = data.trial_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  _parseRawResult(raw) {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  }

  /**
   * Get database schema for ProductSurveyResponse table
   */
  static getSchema() {
    return {
      tableName: 'products_survey_response',
      columns: {
        id: 'VARCHAR(36) PRIMARY KEY',
        product_id: 'VARCHAR(36) NOT NULL',
        status: "ENUM('pending_ai', 'passed', 'failed', 'needs_review') DEFAULT 'pending_ai'",
        alignment_level: "ENUM('beginner', 'emerging', 'consistent', 'unknown') DEFAULT 'unknown'",
        overall_score: 'INT DEFAULT 0',
        ai_comment: 'TEXT NULL',
        ai_raw_result: 'JSON NULL',
        criteria_breakdown: 'JSON NULL',
        trial_count: 'INT DEFAULT 1',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [],
      indexes: [
        'INDEX idx_response_product_id (product_id)',
        'INDEX idx_response_status (status)',
        'INDEX idx_response_alignment_level (alignment_level)',
        'INDEX idx_response_overall_score (overall_score)',
        'INDEX idx_response_trial_count (trial_count)',
        'INDEX idx_response_created_at (created_at)'
      ]
    };
  }

  /**
   * Find response by ID
   * @param {string} id
   * @returns {Promise<ProductSurveyResponse|null>}
   */
  static async findById(id) {
    const query = `
      SELECT id, product_id, status, alignment_level, overall_score,
             ai_comment, ai_raw_result, criteria_breakdown,
             trial_count, created_at, updated_at
      FROM products_survey_response
      WHERE id = ?
    `;
    
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new ProductSurveyResponse(rows[0]) : null;
  }

  /**
   * Find all responses for a product
   * @param {string} productId
   * @returns {Promise<Array<ProductSurveyResponse>>}
   */
  static async findByProductId(productId) {
    const query = `
      SELECT id, product_id, status, alignment_level, overall_score,
             ai_comment, ai_raw_result, criteria_breakdown,
             trial_count, created_at, updated_at
      FROM products_survey_response
      WHERE product_id = ?
      ORDER BY created_at DESC
    `;
    
    const rows = await executeQuery(query, [productId]);
    return rows.map(row => new ProductSurveyResponse(row));
  }

  /**
   * Get latest trial count for a product
   * @param {string} productId
   * @returns {Promise<number>}
   */
  static async getLatestTrialCount(productId) {
    const query = `
      SELECT MAX(trial_count) as max_trial
      FROM products_survey_response
      WHERE product_id = ?
    `;
    
    const rows = await executeQuery(query, [productId]);
    return rows[0]?.max_trial || 0;
  }

  /**
   * Create a new survey response
   * @param {Object} responseData
   * @returns {Promise<ProductSurveyResponse>}
   */
  static async create(responseData) {
    const id = uuidv4();
    const { 
      product_id, 
      status = 'pending_ai', 
      ai_comment = null,
      ai_raw_result = null,
      trial_count = 1
    } = responseData;
    
    const aiRawResultString = ai_raw_result 
      ? (typeof ai_raw_result === 'string' ? ai_raw_result : JSON.stringify(ai_raw_result))
      : null;
    
    const query = `
      INSERT INTO products_survey_response (
        id, product_id, status, ai_comment, ai_raw_result, 
        trial_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    await executeQuery(query, [
      id, product_id, status, ai_comment, aiRawResultString, trial_count
    ]);
    
    return await ProductSurveyResponse.findById(id);
  }

  /**
   * Update a survey response
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<ProductSurveyResponse|null>}
   */
  static async updateById(id, updateData) {
    const { 
      status, 
      alignment_level, 
      overall_score, 
      ai_comment, 
      ai_raw_result, 
      criteria_breakdown 
    } = updateData;
    
    const updates = [];
    const values = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (alignment_level !== undefined) {
      updates.push('alignment_level = ?');
      values.push(alignment_level);
    }
    if (overall_score !== undefined) {
      updates.push('overall_score = ?');
      values.push(overall_score);
    }
    if (ai_comment !== undefined) {
      updates.push('ai_comment = ?');
      values.push(ai_comment);
    }
    if (ai_raw_result !== undefined) {
      updates.push('ai_raw_result = ?');
      const aiRawResultString = ai_raw_result 
        ? (typeof ai_raw_result === 'string' ? ai_raw_result : JSON.stringify(ai_raw_result))
        : null;
      values.push(aiRawResultString);
    }
    if (criteria_breakdown !== undefined) {
      updates.push('criteria_breakdown = ?');
      const criteriaBreakdownString = criteria_breakdown
        ? (typeof criteria_breakdown === 'string' ? criteria_breakdown : JSON.stringify(criteria_breakdown))
        : null;
      values.push(criteriaBreakdownString);
    }
    
    if (updates.length === 0) {
      return await ProductSurveyResponse.findById(id);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `
      UPDATE products_survey_response
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, values);
    return await ProductSurveyResponse.findById(id);
  }

  /**
   * Find responses by status
   * @param {string} status
   * @returns {Promise<Array<ProductSurveyResponse>>}
   */
  static async findByStatus(status) {
    const query = `
      SELECT id, product_id, status, ai_comment, ai_raw_result, 
             trial_count, created_at, updated_at
      FROM products_survey_response
      WHERE status = ?
      ORDER BY created_at DESC
    `;
    
    const rows = await executeQuery(query, [status]);
    return rows.map(row => new ProductSurveyResponse(row));
  }

  toJSON() {
    return {
      id: this.id,
      product_id: this.product_id,
      status: this.status,
      ai_comment: this.ai_comment,
      ai_raw_result: this.ai_raw_result,
      trial_count: this.trial_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// ============================================================================
// PRODUCT SURVEY ANSWER MODEL
// ============================================================================

class ProductSurveyAnswer {
  constructor(data) {
    this.id = data.id;
    this.survey_response_id = data.survey_response_id;
    this.question_id = data.question_id;
    this.score = data.score;
    this.comment = data.comment;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Joined fields
    this.question_text = data.question_text;
    this.weight = data.weight;
  }

  /**
   * Get database schema for ProductSurveyAnswer table
   */
  static getSchema() {
    return {
      tableName: 'products_survey_answer',
      columns: {
        id: 'VARCHAR(36) PRIMARY KEY',
        survey_response_id: 'VARCHAR(36) NOT NULL',
        question_id: 'VARCHAR(36) NOT NULL',
        score: 'INT NOT NULL',
        comment: 'TEXT NULL',
        created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      },
      foreignKeys: [
        'FOREIGN KEY (survey_response_id) REFERENCES products_survey_response(id) ON DELETE CASCADE',
        'FOREIGN KEY (question_id) REFERENCES products_survey_question(id) ON DELETE CASCADE'
      ],
      indexes: [
        'INDEX idx_answer_survey_response_id (survey_response_id)',
        'INDEX idx_answer_question_id (question_id)',
        'INDEX idx_answer_created_at (created_at)'
      ]
    };
  }

  /**
   * Find answer by ID
   * @param {string} id
   * @returns {Promise<ProductSurveyAnswer|null>}
   */
  static async findById(id) {
    const query = `
      SELECT id, survey_response_id, question_id, score, comment, 
             created_at, updated_at
      FROM products_survey_answer
      WHERE id = ?
    `;
    
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new ProductSurveyAnswer(rows[0]) : null;
  }

  /**
   * Find all answers for a survey response
   * @param {string} surveyResponseId
   * @returns {Promise<Array<ProductSurveyAnswer>>}
   */
  static async findBySurveyResponseId(surveyResponseId) {
    const query = `
      SELECT 
        psa.id, psa.survey_response_id, psa.question_id, psa.score, 
        psa.comment, psa.created_at, psa.updated_at,
        psq.question_text, psq.weight
      FROM products_survey_answer psa
      LEFT JOIN products_survey_question psq ON psa.question_id = psq.id
      WHERE psa.survey_response_id = ?
      ORDER BY psa.created_at ASC
    `;
    
    const rows = await executeQuery(query, [surveyResponseId]);
    return rows.map(row => new ProductSurveyAnswer(row));
  }

  /**
   * Create a new survey answer
   * @param {Object} answerData
   * @returns {Promise<ProductSurveyAnswer>}
   */
  static async create(answerData) {
    const id = uuidv4();
    const { 
      survey_response_id, 
      question_id, 
      score,
      comment = null
    } = answerData;
    
    const query = `
      INSERT INTO products_survey_answer (
        id, survey_response_id, question_id, score, comment, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    await executeQuery(query, [
      id, survey_response_id, question_id, score, comment
    ]);
    
    return await ProductSurveyAnswer.findById(id);
  }

  /**
   * Bulk create multiple survey answers
   * @param {Array<Object>} answersData
   * @returns {Promise<Array<ProductSurveyAnswer>>}
   */
  static async bulkCreate(answersData) {
    if (!answersData || answersData.length === 0) {
      return [];
    }

    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();
      
      const createdAnswers = [];
      
      for (const answerData of answersData) {
        const id = uuidv4();
        const { 
          survey_response_id, 
          question_id, 
          score,
          comment = null
        } = answerData;
        
        const query = `
          INSERT INTO products_survey_answer (
            id, survey_response_id, question_id, score, comment, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        await connection.execute(query, [
          id, survey_response_id, question_id, score, comment
        ]);
        
        const [rows] = await connection.execute(
          'SELECT * FROM products_survey_answer WHERE id = ?',
          [id]
        );
        
        if (rows.length > 0) {
          createdAnswers.push(new ProductSurveyAnswer(rows[0]));
        }
      }
      
      await connection.commit();
      return createdAnswers;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a survey answer
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<ProductSurveyAnswer|null>}
   */
  static async updateById(id, updateData) {
    const { score, comment } = updateData;
    
    const updates = [];
    const values = [];
    
    if (score !== undefined) {
      updates.push('score = ?');
      values.push(score);
    }
    if (comment !== undefined) {
      updates.push('comment = ?');
      values.push(comment);
    }
    
    if (updates.length === 0) {
      return await ProductSurveyAnswer.findById(id);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `
      UPDATE products_survey_answer
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, values);
    return await ProductSurveyAnswer.findById(id);
  }

  toJSON() {
    return {
      id: this.id,
      survey_response_id: this.survey_response_id,
      question_id: this.question_id,
      score: this.score,
      comment: this.comment,
      question_text: this.question_text,
      weight: this.weight,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ProductSurveyQuestion,
  ProductSurveyResponse,
  ProductSurveyAnswer
};
