-- Migration: Add event_products table and update related tables
-- Created: 2025-10-25
-- Description: Maps products to events with event-specific pricing and stock

-- 1. Create event_products table
CREATE TABLE IF NOT EXISTS event_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  product_id INT NOT NULL,
  event_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE KEY unique_event_product (event_id, product_id),
  
  -- Foreign Keys
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Indexes
  INDEX idx_event_products_event_id (event_id),
  INDEX idx_event_products_product_id (product_id),
  INDEX idx_event_products_status (status)
);

-- 2. Add unassigned_stock_quantity to products table
-- This column tracks stock available for assignment to events
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unassigned_stock_quantity INT DEFAULT 0 
COMMENT 'Stock available for assignment to events';

-- 3. Add event_id to product_reservations table
-- This tracks which event the reservation was made at (if applicable)
ALTER TABLE product_reservations 
ADD COLUMN IF NOT EXISTS event_id INT NULL 
COMMENT 'Event where product was reserved, if applicable';

-- 4. Update option_of_delivery enum to include 'event'
-- First, check current values and update enum
ALTER TABLE product_reservations 
MODIFY COLUMN option_of_delivery 
ENUM('pickup','delivery','event') NOT NULL DEFAULT 'delivery';

-- 5. Add foreign key for event_id in product_reservations
ALTER TABLE product_reservations 
ADD CONSTRAINT fk_reservation_event 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- 6. Add index for event_id in product_reservations
CREATE INDEX IF NOT EXISTS idx_reservations_event_id 
ON product_reservations(event_id);

-- Verification queries
SELECT 'Tables created/updated successfully' AS status;

-- Show event_products table structure
DESCRIBE event_products;

-- Show updated products columns
SHOW COLUMNS FROM products LIKE '%stock%';

-- Show updated product_reservations columns
SHOW COLUMNS FROM product_reservations WHERE Field IN ('event_id', 'option_of_delivery');
