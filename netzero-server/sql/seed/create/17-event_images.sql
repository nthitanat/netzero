-- Fresh schema: event_images. Apply CREATE files in numeric order.
CREATE TABLE event_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  role ENUM('thumbnail', 'poster') NOT NULL,
  relative_path VARCHAR(1024) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  file_modified_ms BIGINT UNSIGNED NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_images_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY uq_event_image_role (event_id, role),
  KEY idx_event_images_parent (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
