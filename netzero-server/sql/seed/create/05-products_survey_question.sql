-- Fresh schema: products_survey_question. Apply CREATE files in numeric order.
CREATE TABLE `products_survey_question` (
  `id` varchar(36) NOT NULL,
  `question_id` varchar(50) NOT NULL,
  `question_text` text NOT NULL,
  `scoring_criteria` text,
  `weight` decimal(3,2) DEFAULT '1.00',
  `is_active` tinyint(1) DEFAULT '1',
  `criterion_code` varchar(20) DEFAULT NULL,
  `criterion_name_th` varchar(255) DEFAULT NULL,
  `standard_reference` varchar(50) DEFAULT NULL,
  `display_order` int DEFAULT '999',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`),
  KEY `idx_question_is_active` (`is_active`),
  KEY `idx_question_created_at` (`created_at`),
  KEY `idx_criterion_code` (`criterion_code`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_question_id` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
