-- Add 'event' option to option_of_delivery ENUM and add reserved_unit_price column
-- This migration adds support for event-based product reservations

-- Step 1: Add reserved_unit_price column if it doesn't exist
ALTER TABLE product_reservations 
ADD COLUMN IF NOT EXISTS reserved_unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 
COMMENT 'Price per unit at time of reservation'
AFTER quantity;

-- Step 2: Modify option_of_delivery ENUM to include 'event'
ALTER TABLE product_reservations 
MODIFY COLUMN option_of_delivery ENUM('pickup','delivery','event') NOT NULL DEFAULT 'delivery';

-- Verify the changes
DESCRIBE product_reservations;

SELECT 'Migration completed successfully!' AS status;
