-- Update product_reservations table with new fields
-- This script adds: option_of_delivery, user_note, seller_note, pickup_date

USE netzero;

-- Add columns one by one for better compatibility
ALTER TABLE product_reservations 
ADD option_of_delivery ENUM('pickup', 'delivery') NOT NULL DEFAULT 'delivery' AFTER shipping_address;

ALTER TABLE product_reservations 
ADD user_note TEXT AFTER option_of_delivery;

ALTER TABLE product_reservations 
ADD seller_note TEXT AFTER user_note;

ALTER TABLE product_reservations 
ADD pickup_date DATETIME NULL AFTER seller_note;

-- Add index for better query performance
CREATE INDEX idx_pickup_date ON product_reservations(pickup_date);
CREATE INDEX idx_option_of_delivery ON product_reservations(option_of_delivery);

-- Show the updated table structure
DESCRIBE product_reservations;