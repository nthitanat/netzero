-- Create chatApps table
--- Insert sample products first (if they don't exist)
-- Note: We'll use INSERT IGNORE to avoid duplicates if products already exist
-- First, let's get the first two user IDs that exist in the users table
SET @user1 = (SELECT id FROM users LIMIT 1);
SET @user2 = (SELECT id FROM users WHERE id != @user1 LIMIT 1);

-- If we have at least one user, insert sample products
INSERT IGNORE INTO products (id, title, description, price, category, type, user_id) 
SELECT * FROM (
    SELECT 1 as id, 'Organic Brown Rice' as title, 'Premium organic brown rice grown without pesticides' as description, 150.00 as price, 'Grains' as category, 'market' as type, @user1 as user_id
    UNION ALL
    SELECT 2, 'Native Tree Seedlings', 'Collection of native tree seedlings for reforestation', 50.00, 'Plants', 'market', COALESCE(@user1, 1)
    UNION ALL  
    SELECT 3, 'Fresh Organic Vegetables', 'Mixed seasonal organic vegetables from local farm', 80.00, 'Vegetables', 'market', COALESCE(@user2, @user1, 1)
) AS tmp
WHERE @user1 IS NOT NULL;

-- Insert sample chat applications (only if we have users and products)
INSERT IGNORE INTO chatApps (id, owner_id, product_id, title, description) 
SELECT * FROM (
    SELECT 'chat-001' as id, @user1 as owner_id, 1 as product_id, 'Chat about Organic Rice' as title, 'Discussion about organic rice varieties and growing methods' as description
    UNION ALL
    SELECT 'chat-002', @user1, 2, 'Tree Planting Discussion', 'Planning for community tree planting project'
    UNION ALL
    SELECT 'chat-003', COALESCE(@user2, @user1), 3, 'Local Vegetables Exchange', 'Exchange information about local vegetable farming'
) AS tmp
WHERE @user1 IS NOT NULL AND EXISTS (SELECT 1 FROM products WHERE id IN (1, 2, 3)); stores chat applications related to products

CREATE TABLE IF NOT EXISTS chatApps (
  id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
  owner_id INT NOT NULL,
  product_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'closed', 'archived') NOT NULL DEFAULT 'active',
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_chatapps_owner (owner_id),
  INDEX idx_chatapps_product (product_id),
  INDEX idx_chatapps_status (status),
  INDEX idx_chatapps_active (isActive),
  INDEX idx_chatapps_created (createdAt)
);

-- Insert sample products first (if they don't exist)
-- Note: We'll use INSERT IGNORE to avoid duplicates if products already exist
INSERT IGNORE INTO products (id, title, description, price, category, type, user_id) VALUES
(1, 'Organic Brown Rice', 'Premium organic brown rice grown without pesticides', 150.00, 'Grains', 'market', 1),
(2, 'Native Tree Seedlings', 'Collection of native tree seedlings for reforestation', 50.00, 'Plants', 'market', 1),
(3, 'Fresh Organic Vegetables', 'Mixed seasonal organic vegetables from local farm', 80.00, 'Vegetables', 'market', 2);

-- Insert sample chat applications
INSERT INTO chatApps (id, owner_id, product_id, title, description) VALUES
('chat-001', 1, 15, 'Chat about Organic Rice', 'Discussion about organic rice varieties and growing methods'),
('chat-002', 1, 2, 'Tree Planting Discussion', 'Planning for community tree planting project'),
('chat-003', 2, 3, 'Local Vegetables Exchange', 'Exchange information about local vegetable farming');

-- Verify the table was created successfully
SELECT 
  c.id,
  c.title,
  c.description,
  c.status,
  u.firstName,
  u.lastName,
  p.title AS productName,
  c.createdAt
FROM chatApps c
JOIN users u ON c.owner_id = u.id
JOIN products p ON c.product_id = p.id
ORDER BY c.createdAt DESC;
