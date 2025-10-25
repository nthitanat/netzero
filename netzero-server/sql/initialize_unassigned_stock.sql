-- Initialize unassigned_stock_quantity for existing products
-- This sets unassigned_stock_quantity equal to stock_quantity for products that haven't been assigned to events yet

UPDATE products 
SET unassigned_stock_quantity = stock_quantity 
WHERE unassigned_stock_quantity IS NULL OR unassigned_stock_quantity = 0;

-- Verify the update
SELECT 
    id,
    title,
    stock_quantity,
    unassigned_stock_quantity
FROM products
ORDER BY id;
