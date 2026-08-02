-- SQL Script to create the users, events and user_events tables for the NetZero project
-- Execute these commands in your MySQL database (in this order, due to FK dependencies)
--
-- NOTE: These tables were previously created automatically at server startup by the
-- "ensure database" workflow (src/utils/databaseEnsure.js), which has been removed.
-- This script is now the source of truth for creating them on a fresh database.

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin', 'seller', 'community_head') DEFAULT 'user',
    profileImage TEXT NULL,
    phoneNumber VARCHAR(20) NULL,
    address TEXT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    lastLogin DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for better performance
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_isActive (isActive),
    INDEX idx_users_createdAt (createdAt)
);

-- Create Events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    category VARCHAR(100),
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    max_participants INT DEFAULT 0,
    current_participants INT DEFAULT 0,
    registration_deadline DATETIME NULL,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    isRecommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for better performance
    INDEX idx_events_event_date (event_date),
    INDEX idx_events_category (category),
    INDEX idx_events_status (status),
    INDEX idx_events_isRecommended (isRecommended),
    INDEX idx_events_created_at (created_at)
);

-- Create User_Events table (join table between users and events)
CREATE TABLE IF NOT EXISTS user_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,

    -- Indexes for better performance
    INDEX idx_user_events_user_id (user_id),
    INDEX idx_user_events_event_id (event_id),
    INDEX idx_user_events_joined_at (joined_at),
    UNIQUE INDEX unique_user_event (user_id, event_id)
);
