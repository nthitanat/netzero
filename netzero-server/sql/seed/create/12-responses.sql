-- Fresh schema: responses. Apply CREATE files in numeric order.
CREATE TABLE `responses` (
  `response_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL COMMENT 'Authenticated user who submitted (if logged in)',
  `survey_id` int NOT NULL,
  `respondent_id` varchar(255) DEFAULT NULL COMMENT 'Anonymous respondent identifier (session/email/etc)',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`response_id`),
  KEY `idx_responses_user_id` (`user_id`),
  KEY `idx_responses_survey_id` (`survey_id`),
  KEY `idx_responses_respondent_id` (`respondent_id`),
  KEY `idx_responses_submitted_at` (`submitted_at`),
  KEY `idx_responses_created_at` (`created_at`),
  CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
