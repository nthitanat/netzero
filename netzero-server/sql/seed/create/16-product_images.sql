-- Fresh schema: product_images. Apply CREATE files in numeric order.
CREATE TABLE product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  role ENUM('thumbnail', 'cover', 'gallery') NOT NULL,
  image_number INT UNSIGNED NULL,
  display_position INT UNSIGNED NULL,
  relative_path VARCHAR(1024) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  file_modified_ms BIGINT UNSIGNED NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fixed_role VARCHAR(20) GENERATED ALWAYS AS
    (CASE WHEN role = 'gallery' THEN NULL ELSE role END) STORED,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT chk_product_image_role CHECK (
    (role = 'gallery' AND image_number IS NOT NULL AND image_number > 0 AND display_position IS NOT NULL)
    OR (role <> 'gallery' AND image_number IS NULL AND display_position IS NULL)
  ),
  UNIQUE KEY uq_product_fixed_image (product_id, fixed_role),
  UNIQUE KEY uq_product_gallery_number (product_id, image_number),
  KEY idx_product_images_parent (product_id, role, display_position, image_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
