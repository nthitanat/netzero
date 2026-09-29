-- Fresh schema: answers. Apply CREATE files in numeric order.
CREATE TABLE `answers` (
  `answer_id` int NOT NULL AUTO_INCREMENT,
  `response_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_text` text COMMENT 'Free text answer for text/open-ended questions',
  `answer_choice_id` int DEFAULT NULL COMMENT 'Selected choice ID for multiple choice questions',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`answer_id`),
  KEY `idx_answers_response_id` (`response_id`),
  KEY `idx_answers_question_id` (`question_id`),
  KEY `idx_answers_choice_id` (`answer_choice_id`),
  KEY `idx_answers_created_at` (`created_at`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `responses` (`response_id`) ON DELETE CASCADE,
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
