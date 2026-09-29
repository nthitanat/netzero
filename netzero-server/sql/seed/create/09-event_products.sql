-- Fresh schema: event_products. Apply CREATE files in numeric order.
CREATE TABLE `event_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `product_id` int NOT NULL,
  `event_price` decimal(10,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_product` (`event_id`,`product_id`),
  KEY `idx_event_products_event_id` (`event_id`),
  KEY `idx_event_products_product_id` (`product_id`),
  KEY `idx_event_products_status` (`status`),
  CONSTRAINT `event_products_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `event_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
