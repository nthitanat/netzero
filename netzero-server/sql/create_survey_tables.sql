-- SQL Script to create the surveys, questions, responses and answers tables for the NetZero project
-- Execute these commands in your MySQL database (in this order, due to FK dependencies)
-- Requires: users table (see create_users_events_tables.sql)
--
-- NOTE: These tables were previously created automatically at server startup by the
-- "ensure database" workflow (src/utils/databaseEnsure.js), which has been removed.
-- This script is now the source of truth for creating them on a fresh database.

-- Create Surveys table
CREATE TABLE IF NOT EXISTS surveys (
    survey_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for better performance
    INDEX idx_surveys_name (name),
    INDEX idx_surveys_start_date (start_date),
    INDEX idx_surveys_end_date (end_date),
    INDEX idx_surveys_created_at (created_at)
);

-- Create Questions table
CREATE TABLE IF NOT EXISTS questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    survey_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'multiple_choice', 'yes_no', 'rating', 'checkbox') DEFAULT 'text',
    order_in_survey INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,

    -- Indexes for better performance
    INDEX idx_questions_survey_id (survey_id),
    INDEX idx_questions_order (order_in_survey),
    INDEX idx_questions_type (question_type),
    INDEX idx_questions_created_at (created_at)
);

-- Create Responses table
CREATE TABLE IF NOT EXISTS responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'Authenticated user who submitted (if logged in)',
    survey_id INT NOT NULL,
    respondent_id VARCHAR(255) NULL COMMENT 'Anonymous respondent identifier (session/email/etc)',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(survey_id) ON DELETE CASCADE,

    -- Indexes for better performance
    INDEX idx_responses_user_id (user_id),
    INDEX idx_responses_survey_id (survey_id),
    INDEX idx_responses_respondent_id (respondent_id),
    INDEX idx_responses_submitted_at (submitted_at),
    INDEX idx_responses_created_at (created_at)
);

-- Create Answers table
CREATE TABLE IF NOT EXISTS answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT NULL COMMENT 'Free text answer for text/open-ended questions',
    answer_choice_id INT NULL COMMENT 'Selected choice ID for multiple choice questions',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (response_id) REFERENCES responses(response_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,

    -- Indexes for better performance
    INDEX idx_answers_response_id (response_id),
    INDEX idx_answers_question_id (question_id),
    INDEX idx_answers_choice_id (answer_choice_id),
    INDEX idx_answers_created_at (created_at)
);
