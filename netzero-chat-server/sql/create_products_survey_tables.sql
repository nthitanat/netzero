-- Create products_survey_question, products_survey_response and
-- products_survey_answer tables for the NetZero chat server.
--
-- NOTE: These tables were previously created/kept-in-sync automatically at
-- runtime by the "ensure database" workflow (src/utils/databaseEnsure.js),
-- which has been removed. This script is now the source of truth and matches
-- the current model schemas in src/models/ProductSurvey.js (2026-08-02).
--
-- IMPORTANT: this replaces an older version of this script that was missing
-- several columns (question_id, scoring_criteria, criterion_code,
-- criterion_name_th, standard_reference, display_order, alignment_level,
-- overall_score, criteria_breakdown) which had only been getting added to the
-- production table automatically by the now-removed ensureDatabase workflow.
-- If your production table predates this, verify it already has these columns
-- (it likely does, since ensureDatabase would have added them on deploy) and
-- double-check the `status` ENUM below - see note underneath the table.

-- Create products_survey_question table
-- This table stores the survey questions for product net-zero assessment
-- Each question represents a criteria from the Thai beginner survey (1-10 scale)

CREATE TABLE IF NOT EXISTS products_survey_question (
  id VARCHAR(36) PRIMARY KEY,
  question_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Stable external question identifier',
  question_text TEXT NOT NULL COMMENT 'The survey question text in Thai or English',
  scoring_criteria TEXT COMMENT 'Description of how this question is scored',
  weight DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Weight of this question in overall scoring',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this question is currently active',
  criterion_code VARCHAR(20) NULL COMMENT 'SBTi/ISO criterion code',
  criterion_name_th VARCHAR(255) NULL COMMENT 'Criterion name in Thai',
  standard_reference VARCHAR(50) NULL COMMENT 'Reference standard (e.g. SBTi, ISO IWA 42)',
  display_order INT DEFAULT 999 COMMENT 'Display order within the survey',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_question_is_active (is_active),
  INDEX idx_question_created_at (created_at),
  INDEX idx_criterion_code (criterion_code),
  INDEX idx_display_order (display_order),
  UNIQUE INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Survey questions for product net-zero assessment (1-10 scale)';

-- Create products_survey_response table
-- This table stores the survey responses with AI evaluation results
-- Each response represents one trial/submission for a product
--
-- NOTE on `status`: the model (src/models/ProductSurvey.js) defines this as
-- ENUM('pending_ai', 'passed', 'failed', 'needs_review'), but an older version
-- of this script defined ENUM('pending_ai', 'pass', 'fail', 'needs_review').
-- ensureDatabase never ALTERs existing column definitions (only adds missing
-- columns), so if your production table was created from the old script, its
-- `status` column may still only accept 'pass'/'fail' instead of
-- 'passed'/'failed'. Verify with `SHOW COLUMNS FROM products_survey_response
-- LIKE 'status'` and run an `ALTER TABLE ... MODIFY COLUMN status ENUM(...)`
-- if needed.

CREATE TABLE IF NOT EXISTS products_survey_response (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products table',
  status ENUM('pending_ai', 'passed', 'failed', 'needs_review') DEFAULT 'pending_ai' COMMENT 'AI evaluation status',
  alignment_level ENUM('beginner', 'emerging', 'consistent', 'unknown') DEFAULT 'unknown' COMMENT 'Overall alignment level from AI evaluation',
  overall_score INT DEFAULT 0 COMMENT 'Overall score (0-100) from AI evaluation',
  ai_comment TEXT COMMENT 'Short explanation from AI (2-4 sentences)',
  ai_raw_result JSON COMMENT 'Full AI JSON response for audit/debug',
  criteria_breakdown JSON COMMENT 'Per-criterion score breakdown from AI evaluation',
  trial_count INT DEFAULT 1 COMMENT 'Trial number for this product (incremental)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_response_product_id (product_id),
  INDEX idx_response_status (status),
  INDEX idx_response_alignment_level (alignment_level),
  INDEX idx_response_overall_score (overall_score),
  INDEX idx_response_trial_count (trial_count),
  INDEX idx_response_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Survey responses with AI evaluation results for products';

-- Create products_survey_answer table
-- This table stores individual answers to survey questions
-- Links survey responses to questions with scores

CREATE TABLE IF NOT EXISTS products_survey_answer (
  id VARCHAR(36) PRIMARY KEY,
  survey_response_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products_survey_response',
  question_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products_survey_question',
  score INT NOT NULL COMMENT 'Score value (1-10 scale)',
  comment TEXT COMMENT 'Optional extra note or AI per-question comment',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_answer_survey_response_id (survey_response_id),
  INDEX idx_answer_question_id (question_id),
  INDEX idx_answer_created_at (created_at),
  FOREIGN KEY (survey_response_id) REFERENCES products_survey_response(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES products_survey_question(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual answers linking responses to questions with scores';
