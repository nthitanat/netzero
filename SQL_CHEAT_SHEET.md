# NetZero SQL Command Cheat Sheet

Based on your application models: User and Event

## Database Connection
```bash
# Connect to MySQL database
mysql -h 127.0.0.1 -P 3306 -u netzeroadmin -p netzero
```

## Table Creation Commands

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    profileImage VARCHAR(500),
    phoneNumber VARCHAR(20),
    address TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (isActive)
);
```

### Events Table
```sql
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    category VARCHAR(100),
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    max_participants INT,
    current_participants INT DEFAULT 0,
    registration_deadline DATETIME,
    status ENUM('active', 'inactive', 'cancelled', 'completed') DEFAULT 'active',
    isRecommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_recommended (isRecommended),
    INDEX idx_event_date (event_date)
);
```

## User Operations

### Create User
```sql
INSERT INTO users (email, password, firstName, lastName, role, profileImage, phoneNumber, address)
VALUES ('user@example.com', '$2a$12$hashedpassword', 'John', 'Doe', 'user', NULL, NULL, NULL);
```

### Find User by Email
```sql
SELECT id, email, password, firstName, lastName, role, profileImage, phoneNumber, address, 
       isActive, emailVerified, lastLogin, createdAt, updatedAt
FROM users 
WHERE email = 'user@example.com' AND isActive = TRUE;
```

### Find User by ID
```sql
SELECT id, email, firstName, lastName, role, profileImage, phoneNumber, address, 
       isActive, emailVerified, lastLogin, createdAt, updatedAt
FROM users 
WHERE id = 1 AND isActive = TRUE;
```

### Update User Profile
```sql
UPDATE users 
SET firstName = 'John', lastName = 'Smith', profileImage = 'path/to/image.jpg', 
    phoneNumber = '+1234567890', address = '123 Main St', updatedAt = CURRENT_TIMESTAMP
WHERE id = 1 AND isActive = TRUE;
```

### Update User Password
```sql
UPDATE users 
SET password = '$2a$12$newhashedpassword', updatedAt = CURRENT_TIMESTAMP
WHERE id = 1 AND isActive = TRUE;
```

### Update Last Login
```sql
UPDATE users 
SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
WHERE id = 1 AND isActive = TRUE;
```

### Soft Delete User
```sql
UPDATE users 
SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP
WHERE id = 1 AND isActive = TRUE;
```

### Get All Users (with pagination)
```sql
SELECT id, email, firstName, lastName, role, profileImage, phoneNumber, address, 
       isActive, emailVerified, lastLogin, createdAt, updatedAt
FROM users 
WHERE isActive = TRUE
ORDER BY createdAt DESC
LIMIT 50 OFFSET 0;
```

### Get Total User Count
```sql
SELECT COUNT(*) as count FROM users WHERE isActive = TRUE;
```

### Check if Email Exists
```sql
SELECT id FROM users WHERE email = 'user@example.com' AND isActive = TRUE;
```

## Event Operations

### Get All Events
```sql
SELECT * FROM events ORDER BY created_at DESC;
```

### Get Event by ID
```sql
SELECT * FROM events WHERE id = 1;
```

### Get Events by Category
```sql
SELECT * FROM events 
WHERE category = 'environment' AND status = 'active' 
ORDER BY created_at DESC;
```

### Search Events by Title
```sql
SELECT * FROM events 
WHERE title LIKE '%tree%' AND status = 'active' 
ORDER BY created_at DESC;
```

### Get Recommended Events
```sql
SELECT * FROM events 
WHERE isRecommended = 1 AND status = 'active' 
ORDER BY created_at DESC;
```

### Create New Event
```sql
INSERT INTO events (title, description, event_date, location, category, organizer, 
                   contact_email, contact_phone, max_participants, registration_deadline, 
                   status, isRecommended)
VALUES ('Tree Planting Event', 'Community tree planting initiative', 
        '2025-10-15 09:00:00', 'Central Park', 'environment', 'Green Society',
        'contact@greensociety.org', '+1234567890', 50, '2025-10-10 23:59:59',
        'active', TRUE);
```

### Update Event
```sql
UPDATE events 
SET title = 'Updated Event Title', description = 'Updated description',
    max_participants = 75, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

### Update Event Status
```sql
UPDATE events 
SET status = 'completed', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

### Update Participant Count
```sql
UPDATE events 
SET current_participants = current_participants + 1, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

## Advanced Queries

### Users with Recent Activity
```sql
SELECT u.id, u.firstName, u.lastName, u.email, u.lastLogin
FROM users u
WHERE u.isActive = TRUE 
  AND u.lastLogin >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY u.lastLogin DESC;
```

### Events Happening This Month
```sql
SELECT e.id, e.title, e.event_date, e.location, e.category
FROM events e
WHERE e.status = 'active'
  AND MONTH(e.event_date) = MONTH(CURRENT_DATE())
  AND YEAR(e.event_date) = YEAR(CURRENT_DATE())
ORDER BY e.event_date ASC;
```

### Events with Available Spots
```sql
SELECT e.id, e.title, e.max_participants, e.current_participants,
       (e.max_participants - e.current_participants) AS available_spots
FROM events e
WHERE e.status = 'active'
  AND e.current_participants < e.max_participants
  AND e.event_date > NOW()
ORDER BY e.event_date ASC;
```

### User Statistics
```sql
SELECT 
    COUNT(*) AS total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admin_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) AS user_count,
    COUNT(CASE WHEN emailVerified = TRUE THEN 1 END) AS verified_users,
    COUNT(CASE WHEN lastLogin >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS active_last_30_days
FROM users 
WHERE isActive = TRUE;
```

### Event Statistics by Category
```sql
SELECT 
    category,
    COUNT(*) AS total_events,
    COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_events,
    COUNT(CASE WHEN isRecommended = TRUE THEN 1 END) AS recommended_events,
    AVG(max_participants) AS avg_max_participants,
    SUM(current_participants) AS total_participants
FROM events
GROUP BY category
ORDER BY total_events DESC;
```

## Database Maintenance

### Check Table Status
```sql
SHOW TABLE STATUS FROM netzero;
```

### Analyze Tables
```sql
ANALYZE TABLE users, events;
```

### Optimize Tables
```sql
OPTIMIZE TABLE users, events;
```

### Show Indexes
```sql
SHOW INDEX FROM users;
SHOW INDEX FROM events;
```

### Database Size Information
```sql
SELECT 
    table_name AS 'Table',
    round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'netzero'
ORDER BY (data_length + index_length) DESC;
```

## Backup and Restore

### Backup Database
```bash
# Full database backup
mysqldump -u netzeroadmin -p netzero > netzero_backup_$(date +%Y%m%d).sql

# Backup specific tables
mysqldump -u netzeroadmin -p netzero users events > netzero_tables_backup.sql

# Backup structure only
mysqldump -u netzeroadmin -p --no-data netzero > netzero_structure.sql
```

### Restore Database
```bash
# Restore from backup
mysql -u netzeroadmin -p netzero < netzero_backup_20250921.sql
```

## Performance Tips

1. **Use Indexes**: Your tables already have good indexes on frequently queried columns
2. **Limit Results**: Always use LIMIT for large datasets
3. **Use Prepared Statements**: Your models already use this pattern
4. **Monitor Slow Queries**: Enable slow query log in MySQL
5. **Regular Maintenance**: Run ANALYZE and OPTIMIZE periodically

## Common Environment Variables
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=netzeroadmin
DB_PASSWORD=your_password
DB_NAME=netzero
```

## Troubleshooting

### Check Connection
```sql
SELECT 1;
```

### Show Current Connections
```sql
SHOW PROCESSLIST;
```

### Show Database Users
```sql
SELECT User, Host FROM mysql.user;
```

### Check Table Constraints
```sql
SELECT * FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'netzero';
```