-- Fresh schema: products_survey_response. Apply CREATE files in numeric order.
CREATE TABLE `products_survey_response` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `status` enum('pending_ai','passed','failed','needs_review') DEFAULT 'pending_ai',
  `alignment_level` enum('beginner','emerging','consistent','unknown') DEFAULT 'unknown',
  `overall_score` int DEFAULT '0',
  `ai_comment` text,
  `ai_raw_result` json DEFAULT NULL,
  `criteria_breakdown` json DEFAULT NULL,
  `trial_count` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_response_product_id` (`product_id`),
  KEY `idx_response_status` (`status`),
  KEY `idx_response_alignment_level` (`alignment_level`),
  KEY `idx_response_overall_score` (`overall_score`),
  KEY `idx_response_trial_count` (`trial_count`),
  KEY `idx_response_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
