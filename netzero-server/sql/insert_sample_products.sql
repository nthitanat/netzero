-- SQL Script to insert sample products data into the new database structure
-- Note: You may need to adjust user_id values based on your actual user IDs in the database

-- Insert sample products based on productsData.js
INSERT INTO products (
    id, project_id, title, description, price, category, type, 
    address, coordinate, stock_quantity, isRecommend, user_id
) VALUES 
(
    1, -- id
    NULL, -- project_id (can be left blank as specified)
    'เสื้อผ้าชาวม๊ง', -- title
    'เสื้อผ้าทอมือแบบดั้งเดิมของชาวม๊ง จังหวัดน่าน ลวดลายสวยงาม ผ้าคุณภาพดี ผลิตภัณฑ์จากภูมิปญญาท้องถิ่น', -- description
    850.00, -- price
    'เสื้อผ้า', -- category
    'market', -- type (marketType from original data)
    'น่าน', -- address (using origin as address)
    '100.7750,19.2186', -- coordinate (Nan coordinates)
    8, -- stock_quantity (using quantity from original data)
    TRUE, -- isRecommend (isRecommended from original data)
    1 -- user_id (you may need to adjust this to match actual user IDs)
),
(
    2, -- id
    NULL, -- project_id
    'พริกหยวกชาวม๊ง', -- title
    'พริกหยวกสดจากไร่สูงชาวม๊ง ปลูกแบบธรรมชาติ ไม่ใช้สารเคมี', -- description
    180.00, -- price
    'ผักสด', -- category
    'market', -- type
    'น่าน', -- address
    '100.7750,19.2186', -- coordinate
    15, -- stock_quantity
    FALSE, -- isRecommend
    2 -- user_id
),
(
    3, -- id
    NULL, -- project_id
    'กล่ำปรีชาวม๊ง', -- title
    'กล่ำปรีสดจากไร่สูงชาวม๊ง ปลูกแบบธรรมชาติ ไม่ใช้สารเคมี', -- description
    180.00, -- price
    'ผักสด', -- category
    'market', -- type
    'น่าน', -- address
    '100.7750,19.2186', -- coordinate
    3, -- stock_quantity
    FALSE, -- isRecommend
    3 -- user_id
);

-- Add more sample products with different types
INSERT INTO products (
    title, description, price, category, type, 
    address, coordinate, stock_quantity, isRecommend, user_id
) VALUES 
(
    'ข้าวอินทรีย์จากเชียงใหม่', -- title
    'ข้าวหอมมะลิอินทรีย์ปลูกโดยเกษตรกรท้องถิ่น ไม่ใช้สารเคมี ผ่านการรับรองมาตรฐานอินทรีย์', -- description
    120.00, -- price per kg
    'อาหารแห้ง', -- category
    'willing', -- type (สินค้าที่ยินดีแลกเปลี่ยน)
    'เชียงใหม่', -- address
    '98.9628,18.7061', -- coordinate (Chiang Mai)
    50, -- stock_quantity
    TRUE, -- isRecommend
    4 -- user_id
),
(
    'กาแฟอาราบิก้าดอยช้าง', -- title
    'เมล็ดกาแฟอาราบิก้าคั่วสดจากดอยช้าง รสชาติหอมกรุ่น กรรมวิธีแบบดั้งเดิม', -- description
    450.00, -- price per 500g
    'เครื่องดื่ม', -- category
    'barter', -- type (สินค้าแลกเปลี่ยน)
    'เชียงราย', -- address
    '99.8325,19.9071', -- coordinate (Chiang Rai)
    25, -- stock_quantity
    FALSE, -- isRecommend
    5 -- user_id
),
(
    'น้ำผึ้งป่าจากลำปาง', -- title
    'น้ำผึ้งป่าธรรมชาติ 100% จากป่าลำปาง เก็บจากรังผึ้งป่าธรรมชาติ', -- description
    380.00, -- price per 350ml
    'อาหารธรรมชาติ', -- category
    'market', -- type
    'ลำปาง', -- address
    '99.4871,18.2811', -- coordinate (Lampang)
    12, -- stock_quantity
    TRUE, -- isRecommend
    6 -- user_id
),
(
    'ผ้าไหมยกดอกมีนบุรี', -- title
    'ผ้าไหมยกดอกทอมือจากมีนบุรี ลวดลายดั้งเดิม คุณภาพสูง', -- description
    1200.00, -- price per piece
    'เสื้อผ้า', -- category
    'willing', -- type
    'กรุงเทพฯ', -- address
    '100.7331,13.8311', -- coordinate (Bangkok)
    5, -- stock_quantity
    FALSE, -- isRecommend
    7 -- user_id
),
(
    'มะม่วงน้ำดอกไม้สีทอง', -- title
    'มะม่วงน้ำดอกไม้สีทองสุกหวาน จากสวนเกษตรกรท้องถิ่น', -- description
    250.00, -- price per kg
    'ผลไม้สด', -- category
    'barter', -- type
    'ราชบุรี', -- address
    '99.8134,13.5282', -- coordinate (Ratchaburi)
    30, -- stock_quantity
    TRUE, -- isRecommend
    8 -- user_id
);

-- Verify the inserted data
SELECT 
    id, title, category, type, price, stock_quantity, 
    isRecommend, address, user_id, created_at
FROM products 
ORDER BY id;

-- Show count by type
SELECT 
    type, 
    COUNT(*) as count,
    AVG(price) as avg_price
FROM products 
GROUP BY type;

-- Show recommended products
SELECT 
    id, title, type, price, stock_quantity
FROM products 
WHERE isRecommend = TRUE
ORDER BY price DESC;