-- Insert sample survey questions for net-zero product assessment
-- These questions are based on Thai beginner net-zero survey (1-10 scale)
-- Questions cover various aspects of sustainability and net-zero criteria

INSERT INTO products_survey_question (id, question_text, weight, is_active, created_at, updated_at) VALUES
  (
    'q001',
    'ผลิตภัณฑ์มีการวัดและรายงานการปล่อยก๊าซเรือนกระจกตลอดวงจรชีวิตผลิตภัณฑ์หรือไม่?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q002',
    'ผลิตภัณฑ์มีเป้าหมายในการลดการปล่อยก๊าซเรือนกระจกที่ชัดเจนและสอดคล้องกับเกณฑ์ SBTi หรือไม่?',
    2.0,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q003',
    'กระบวนการผลิตใช้พลังงานสะอาดหรือพลังงานหมุนเวียนมากน้อยเพียงใด?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q004',
    'วัตถุดิบที่ใช้ในการผลิตเป็นมิตรกับสิ่งแวดล้อมและมีแหล่งที่มาที่ยั่งยืนหรือไม่?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q005',
    'ผลิตภัณฑ์มีการออกแบบเพื่อการใช้งานที่ยาวนานและสามารถซ่อมแซมได้หรือไม่?',
    1.0,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q006',
    'ผลิตภัณฑ์สามารถนำกลับมาใช้ใหม่หรือรีไซเคิลได้ง่ายเมื่อหมดอายุการใช้งานหรือไม่?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q007',
    'บรรจุภัณฑ์มีการลดปริมาณและใช้วัสดุที่เป็นมิตรกับสิ่งแวดล้อมหรือไม่?',
    1.0,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q008',
    'การขนส่งและโลจิสติกส์มีการวางแผนเพื่อลดการปล่อยก๊าซเรือนกระจกหรือไม่?',
    1.0,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q009',
    'บริษัทมีนโยบายและแผนการดำเนินงานเพื่อความยั่งยืนที่ชัดเจนหรือไม่?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'q010',
    'มีการตรวจสอบและรับรองจากองค์กรภายนอกเกี่ยวกับมาตรฐานความยั่งยืนหรือไม่?',
    1.5,
    TRUE,
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  question_text = VALUES(question_text),
  weight = VALUES(weight),
  is_active = VALUES(is_active),
  updated_at = NOW();

-- Display inserted questions
SELECT 
  id,
  SUBSTRING(question_text, 1, 80) as question_preview,
  weight,
  is_active
FROM products_survey_question
ORDER BY id;
