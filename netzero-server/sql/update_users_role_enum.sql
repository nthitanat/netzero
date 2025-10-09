-- Update users table to include 'seller' role in the enum
-- This script modifies the role column to accept 'user', 'admin', and 'seller' values

ALTER TABLE users 
MODIFY COLUMN role ENUM('user', 'admin', 'seller') DEFAULT 'user';

-- Verify the change
SHOW CREATE TABLE users;