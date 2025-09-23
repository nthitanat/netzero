-- SQL Script to create Products and Product_Reservations tables for NetZero project
-- Execute these commands in your MySQL database

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type ENUM('market', 'willing', 'barter') NOT NULL,
    address TEXT NULL,
    coordinate VARCHAR(255) NULL COMMENT 'Stored as comma-separated lat,lng values',
    stock_quantity INT DEFAULT 0,
    isRecommend BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_products_user_id (user_id),
    INDEX idx_products_category (category),
    INDEX idx_products_type (type),
    INDEX idx_products_isRecommend (isRecommend),
    INDEX idx_products_created_at (created_at)
);

-- Create Product_Reservations table
CREATE TABLE IF NOT EXISTS product_reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Customer who made the reservation',
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    note TEXT NULL COMMENT 'Message to seller / pickup method',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_reservations_user_id (user_id),
    INDEX idx_reservations_product_id (product_id),
    INDEX idx_reservations_status (status),
    INDEX idx_reservations_created_at (created_at)
);

-- Create folders for product images (similar to events structure)
-- Note: These are file system operations, not SQL commands
-- You'll need to create these directories manually or via your application:
-- files/products/thumbnail/
-- files/products/cover/
-- files/products/images/

-- Add some sample data validation triggers (optional)
DELIMITER //

CREATE TRIGGER validate_product_stock
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock quantity cannot be negative';
    END IF;
END;//

CREATE TRIGGER validate_reservation_quantity
    BEFORE INSERT ON product_reservations
    FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    SELECT stock_quantity INTO current_stock FROM products WHERE id = NEW.product_id;
    
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation quantity must be positive';
    END IF;
    
    IF NEW.quantity > current_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation quantity exceeds available stock';
    END IF;
END;//

DELIMITER ;

-- Grant necessary permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON netzero.products TO 'netzeroadmin'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON netzero.product_reservations TO 'netzeroadmin'@'%';

-- Show table structures
DESCRIBE products;
DESCRIBE product_reservations;