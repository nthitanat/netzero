-- SQL Script to add shipping_address field to product_reservations table
-- This ALTER TABLE statement will add the new field without removing any existing data
-- Execute this in your MySQL database

USE netzero; -- Replace with your actual database name if different

-- Add shipping_address column to product_reservations table
ALTER TABLE product_reservations 
ADD shipping_address TEXT NULL 
COMMENT 'Customer shipping address for delivery' 
AFTER note;

-- Verify the table structure after modification
DESCRIBE product_reservations;

-- Optional: Show sample of existing data to confirm no data was lost
SELECT COUNT(*) as total_reservations FROM product_reservations;

-- Optional: Show the first few rows to verify the new column is added
SELECT 
    reservation_id,
    user_id,
    product_id,
    quantity,
    note,
    shipping_address,
    status,
    created_at,
    updated_at
FROM product_reservations 
LIMIT 5;