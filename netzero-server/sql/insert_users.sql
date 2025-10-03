-- Insert Sample Users for NetZero Project
-- This script inserts sample user data into the existing users table
-- Note: All passwords are "password123" hashed with bcrypt (12 salt rounds)

-- Insert sample users with different roles
INSERT INTO users (email, password, firstName, lastName, role, profileImage, phoneNumber, address, emailVerified) VALUES
-- Admin user
('admin@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Admin', 'User', 'admin', NULL, '+1234567890', '123 Admin Street, Admin City, AC 12345', TRUE),

-- Seller users
('seller1@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'John', 'Smith', 'seller', NULL, '+1234567891', '456 Seller Ave, Seller City, SC 23456', TRUE),
('seller2@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Sarah', 'Johnson', 'seller', NULL, '+1234567892', '789 Market St, Commerce City, CC 34567', TRUE),
('greenfarm@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Michael', 'Green', 'seller', NULL, '+1234567893', '321 Organic Farm Rd, Green Valley, GV 45678', TRUE),

-- Regular users
('user1@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Alice', 'Wilson', 'user', NULL, '+1234567894', '654 User Lane, User Town, UT 56789', TRUE),
('user2@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Bob', 'Brown', 'user', NULL, '+1234567895', '987 Customer Blvd, Customer City, CC 67890', TRUE),
('user3@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Emma', 'Davis', 'user', NULL, '+1234567896', '147 Buyer St, Buyer Town, BT 78901', TRUE),
('user4@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'David', 'Miller', 'user', NULL, '+1234567897', '258 Shopper Ave, Shopper City, SC 89012', FALSE),
('user5@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Lisa', 'Anderson', 'user', NULL, '+1234567898', '369 Consumer Rd, Consumer Town, CT 90123', TRUE),

-- Test user with minimal data
('test@netzero.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/H96.9em', 'Test', 'User', 'user', NULL, NULL, NULL, TRUE);

-- Verify the inserted users
SELECT 
  id,
  email,
  firstName,
  lastName,
  role,
  phoneNumber,
  isActive,
  emailVerified,
  createdAt
FROM users 
ORDER BY createdAt DESC;