-- Fresh schema: questions. Apply CREATE files in numeric order.
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('text','multiple_choice','yes_no','rating','checkbox') DEFAULT 'text',
  `order_in_survey` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`question_id`),
  KEY `idx_questions_survey_id` (`survey_id`),
  KEY `idx_questions_order` (`order_in_survey`),
  KEY `idx_questions_type` (`question_type`),
  KEY `idx_questions_created_at` (`created_at`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
