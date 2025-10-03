-- Update All Users Passwords
-- This script updates all existing users' passwords to a new hashed password
-- Password: "password123" (hashed with bcrypt, 12 salt rounds)
-- Hash: $2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C

-- Option 1: Update ALL users to the same password
UPDATE users 
SET password = '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C',
    updatedAt = CURRENT_TIMESTAMP
WHERE isActive = TRUE;

-- Option 2: Update passwords for specific users only
-- UPDATE users 
-- SET password = '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C',
--     updatedAt = CURRENT_TIMESTAMP
-- WHERE email IN ('user1@netzero.com', 'user2@netzero.com', 'admin@netzero.com')
-- AND isActive = TRUE;

-- Option 3: Update password for a single user
-- UPDATE users 
-- SET password = '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C',
--     updatedAt = CURRENT_TIMESTAMP
-- WHERE email = 'user@example.com'
-- AND isActive = TRUE;

-- Option 4: Reset passwords and force password change on next login
-- UPDATE users 
-- SET password = '$2a$12$NI6Wh5fB8wKIMfq.ffkyyuuTy8a6OP/Az43mf3Wskd6Y0lyfJsn.C',
--     emailVerified = FALSE,
--     updatedAt = CURRENT_TIMESTAMP
-- WHERE isActive = TRUE;

-- Verify the password update
SELECT 
  id,
  email,
  firstName,
  lastName,
  role,
  emailVerified,
  updatedAt,
  'password123' as newPassword
FROM users 
WHERE isActive = TRUE
ORDER BY updatedAt DESC;

-- Check how many users were updated
SELECT COUNT(*) as updated_users_count 
FROM users 
WHERE isActive = TRUE;