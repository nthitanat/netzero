-- Fresh schema: chatApps. Apply CREATE files in numeric order.
CREATE TABLE `chatApps` (
  `id` varchar(255) NOT NULL,
  `owner_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('active','closed','archived') DEFAULT 'active',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chatApps_owner_id` (`owner_id`),
  KEY `idx_chatApps_product_id` (`product_id`),
  KEY `idx_chatApps_status` (`status`),
  KEY `idx_chatApps_isActive` (`isActive`),
  KEY `idx_chatApps_createdAt` (`createdAt`),
  CONSTRAINT `chatapps_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chatapps_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
