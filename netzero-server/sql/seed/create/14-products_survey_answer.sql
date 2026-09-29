-- Fresh schema: products_survey_answer. Apply CREATE files in numeric order.
CREATE TABLE `products_survey_answer` (
  `id` varchar(36) NOT NULL,
  `survey_response_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `score` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_answer_survey_response_id` (`survey_response_id`),
  KEY `idx_answer_question_id` (`question_id`),
  KEY `idx_answer_created_at` (`created_at`),
  CONSTRAINT `products_survey_answer_ibfk_1` FOREIGN KEY (`survey_response_id`) REFERENCES `products_survey_response` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_survey_answer_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `products_survey_question` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
