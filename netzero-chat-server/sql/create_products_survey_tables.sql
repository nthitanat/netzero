-- Create products_survey_question table
-- This table stores the survey questions for product net-zero assessment
-- Each question represents a criteria from the Thai beginner survey (1-10 scale)

CREATE TABLE IF NOT EXISTS products_survey_question (
  id VARCHAR(36) PRIMARY KEY,
  question_text TEXT NOT NULL COMMENT 'The survey question text in Thai or English',
  weight DECIMAL(5,2) DEFAULT 1.0 COMMENT 'Weight of this question in overall scoring (optional)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this question is currently active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Survey questions for product net-zero assessment';

-- Create products_survey_response table
-- This table stores the survey responses with AI evaluation results
-- Each response represents one trial/submission for a product

CREATE TABLE IF NOT EXISTS products_survey_response (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products table',
  status ENUM('pending_ai', 'pass', 'fail', 'needs_review') DEFAULT 'pending_ai' COMMENT 'AI evaluation status',
  ai_comment TEXT COMMENT 'Short explanation from AI (2-4 sentences)',
  ai_raw_result JSON COMMENT 'Full AI JSON response for audit/debug',
  trial_count INT DEFAULT 1 COMMENT 'Trial number for this product (incremental)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_status (status),
  INDEX idx_trial_count (trial_count),
  INDEX idx_created_at (created_at),
  UNIQUE KEY unique_product_trial (product_id, trial_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Survey responses with AI evaluation for products';

-- Create products_survey_answer table
-- This table stores individual answers to survey questions
-- Links survey responses to questions with scores

CREATE TABLE IF NOT EXISTS products_survey_answer (
  id VARCHAR(36) PRIMARY KEY,
  survey_response_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products_survey_response',
  question_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to products_survey_question',
  score DECIMAL(5,2) NOT NULL COMMENT 'Score value (1-10 scale)',
  comment TEXT COMMENT 'Optional extra note or AI per-question comment',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_survey_response_id (survey_response_id),
  INDEX idx_question_id (question_id),
  INDEX idx_score (score),
  UNIQUE KEY unique_response_question (survey_response_id, question_id),
  FOREIGN KEY (survey_response_id) REFERENCES products_survey_response(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES products_survey_question(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual answers to survey questions';

-- Add indexes for better query performance
CREATE INDEX idx_answer_created_at ON products_survey_answer(created_at);

-- Add comments for clarity
ALTER TABLE products_survey_question 
  COMMENT 'Survey questions for product net-zero assessment (1-10 scale)';

ALTER TABLE products_survey_response 
  COMMENT 'Survey responses with AI evaluation results for products';

ALTER TABLE products_survey_answer 
  COMMENT 'Individual answers linking responses to questions with scores';
