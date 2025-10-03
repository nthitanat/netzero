-- Insert Sample Users
-- This script inserts sample user data into the users table
-- Note: Passwords are already hashed using bcrypt with 12 salt rounds

-- First, let's create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin', 'seller') DEFAULT 'user',
  profileImage VARCHAR(500),
  phoneNumber VARCHAR(20),
  address TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  emailVerified BOOLEAN DEFAULT FALSE,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert multiple users in a single transaction for optimal performance
-- Password for all users: "password123" (hashed with bcrypt, 12 salt rounds)
-- Correct Hash: $2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C

INSERT INTO users (
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    profileImage, 
    phoneNumber, 
    address, 
    emailVerified
) VALUES
    -- Admin user
   
    -- Seller users
    (
        'seller1@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'John', 
        'Smith', 
        'seller', 
        NULL, 
        '+1234567891', 
        '456 Seller Ave, Seller City, SC 23456', 
        TRUE
    ),
    (
        'seller2@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Sarah', 
        'Johnson', 
        'seller', 
        NULL, 
        '+1234567892', 
        '789 Market St, Commerce City, CC 34567', 
        TRUE
    ),
    (
        'greenfarm@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Michael', 
        'Green', 
        'seller', 
        NULL, 
        '+1234567893', 
        '321 Organic Farm Rd, Green Valley, GV 45678', 
        TRUE
    ),
    -- Regular users
    (
        'user1@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Alice', 
        'Wilson', 
        'user', 
        NULL, 
        '+1234567894', 
        '654 User Lane, User Town, UT 56789', 
        TRUE
    ),
    (
        'user2@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Bob', 
        'Brown', 
        'user', 
        NULL, 
        '+1234567895', 
        '987 Customer Blvd, Customer City, CC 67890', 
        TRUE
    ),
    (
        'user3@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Emma', 
        'Davis', 
        'user', 
        NULL, 
        '+1234567896', 
        '147 Buyer St, Buyer Town, BT 78901', 
        TRUE
    ),
    (
        'user4@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'David', 
        'Miller', 
        'user', 
        NULL, 
        '+1234567897', 
        '258 Shopper Ave, Shopper City, SC 89012', 
        FALSE
    ),
    (
        'user5@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Lisa', 
        'Anderson', 
        'user', 
        NULL, 
        '+1234567898', 
        '369 Consumer Rd, Consumer Town, CT 90123', 
        TRUE
    ),
    -- Test user with minimal data
    (
        'test@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Test', 
        'User', 
        'user', 
        NULL, 
        NULL, 
        NULL, 
        TRUE
    ),
     (
        'admin@netzero.com', 
        '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C', 
        'Admin', 
        'User', 
        'admin', 
        NULL, 
        '+1234567890', 
        '123 Admin Street, Admin City, AC 12345', 
        TRUE
    );

-- Update the lastLogin for some users to simulate recent activity
UPDATE users SET lastLogin = NOW() - INTERVAL 1 DAY WHERE email IN ('admin@netzero.com', 'seller1@netzero.com', 'user1@netzero.com');
UPDATE users SET lastLogin = NOW() - INTERVAL 7 DAY WHERE email IN ('seller2@netzero.com', 'user2@netzero.com');
UPDATE users SET lastLogin = NOW() - INTERVAL 30 DAY WHERE email IN ('user3@netzero.com');

-- Display inserted users
SELECT 
  id,
  email,
  firstName,
  lastName,
  role,
  phoneNumber,
  isActive,
  emailVerified,
  lastLogin,
  createdAt
FROM users 
ORDER BY createdAt DESC;