-- Glocal SurveyMonkey check-in feature
-- Tracks whether an email has completed a given SurveyMonkey survey, cached
-- locally so we don't hit SurveyMonkey's rate limits on every check-in.
-- Run this manually against the database (no auto-schema-sync in this project,
-- see netzero-server/docs/DATABASE_ARCHITECTURE.md).

CREATE TABLE IF NOT EXISTS glocal_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id VARCHAR(64) NOT NULL,
  identifier_type ENUM('email') NOT NULL DEFAULT 'email',
  identifier_value VARCHAR(255) NOT NULL,
  surveymonkey_response_id VARCHAR(64) NULL,
  status ENUM('not_started', 'partial', 'completed') NOT NULL DEFAULT 'not_started',
  checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  last_synced_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uq_glocal_checkins_survey_identifier (survey_id, identifier_type, identifier_value),
  INDEX idx_glocal_checkins_status (status)
);
