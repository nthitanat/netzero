/**
 * Script to initialize 28 Thai survey questions mapped to ISO IWA 42 & SBTi criteria
 * This will DELETE all existing questions and insert new ones
 */

const fs = require('fs');
const path = require('path');
const { executeQuery, executeCommand } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

const thaiQuestions = [
  // Criterion 1: Net-zero commitment & boundary (C14)
  {
    question_id: 'c14-q1',
    question_text: 'ธุรกิจของคุณมีการเขียน "เป้าหมายระยะยาว" เรื่องการลดผลกระทบต่อสภาพภูมิอากาศหรือไม่ (เช่น net-zero ภายในปี…)?',
    scoring_criteria: 'คะแนน 1-3: ไม่มีเป้าหมาย | 4-6: มีเป้าหมายแต่ไม่ชัดเจน | 7-8: มีเป้าหมายชัดเจน | 9-10: มีเป้าหมายที่ระบุปีและครอบคลุมทั้งธุรกิจ',
    weight: 1.5,
    criterion_code: 'C14',
    criterion_name_th: 'การตั้งเป้า net-zero และขอบเขต',
    standard_reference: 'SBTi',
    display_order: 1
  },
  {
    question_id: 'c14-q2',
    question_text: 'เป้าหมายนี้ระบุชัดไหมว่าครอบคลุม ทั้งธุรกิจ ไม่ใช่แค่สินค้า/โปรเจกต์เดียว?',
    scoring_criteria: 'คะแนน 1-3: ครอบคลุมแค่บางส่วน | 4-6: ครอบคลุมส่วนใหญ่ | 7-10: ครอบคลุมทั้งองค์กร',
    weight: 1.3,
    criterion_code: 'C14',
    criterion_name_th: 'การตั้งเป้า net-zero และขอบเขต',
    standard_reference: 'SBTi',
    display_order: 2
  },
  {
    question_id: 'c14-q3',
    question_text: 'มีระบุ "ปีเป้าหมาย" ที่อยากเข้าใกล้ net-zero ไหม (เช่น 2040, 2045, 2050)?',
    scoring_criteria: 'คะแนน 1-3: ไม่มีปีเป้าหมาย | 4-6: มีแต่ยังไม่แน่ชัด | 7-8: มีปีเป้าหมายชัดเจน | 9-10: มีปีเป้าหมาย ≤ 2050',
    weight: 1.2,
    criterion_code: 'C14',
    criterion_name_th: 'การตั้งเป้า net-zero และขอบเขต',
    standard_reference: 'SBTi',
    display_order: 3
  },

  // Criterion 2: Organizational & GHG inventory coverage (C1-C3, C10)
  {
    question_id: 'c1-q1',
    question_text: 'คุณมีการลิสต์ กิจกรรมหลัก ที่อาจปล่อยก๊าซเรือนกระจกในธุรกิจแล้วหรือยัง (แก๊ส ไฟฟ้า ขนส่ง บรรจุภัณฑ์ วัตถุดิบ ฯลฯ)?',
    scoring_criteria: 'คะแนน 1-3: ยังไม่เริ่ม | 4-6: ลิสต์บางส่วน | 7-8: ลิสต์ครอบคลุมหลักๆ | 9-10: ลิสต์ครบทุกกิจกรรมสำคัญ',
    weight: 1.4,
    criterion_code: 'C1-C3,C10',
    criterion_name_th: 'การจัดทำ GHG inventory',
    standard_reference: 'SBTi',
    display_order: 4
  },
  {
    question_id: 'c1-q2',
    question_text: 'คุณมีตัวเลขประมาณการบางส่วนไหม (เช่น kWh ไฟฟ้าต่อเดือน จำนวนถังแก๊ส จำนวนเที่ยวส่งของ)?',
    scoring_criteria: 'คะแนน 1-3: ไม่มีตัวเลข | 4-6: มีบางส่วน | 7-8: มีข้อมูลหลักๆ | 9-10: มีข้อมูลครบถ้วนและเก็บอย่างต่อเนื่อง',
    weight: 1.3,
    criterion_code: 'C1-C3,C10',
    criterion_name_th: 'การจัดทำ GHG inventory',
    standard_reference: 'SBTi',
    display_order: 5
  },
  {
    question_id: 'c1-q3',
    question_text: 'คุณเคยคิดถึงการปล่อยจาก ซัพพลายเออร์และขนส่ง นอกเหนือจากในร้าน/โรงงานหรือยัง?',
    scoring_criteria: 'คะแนน 1-3: ยังไม่เคยคิด | 4-6: เคยคิดแต่ยังไม่เก็บข้อมูล | 7-8: กำลังเริ่มเก็บข้อมูล | 9-10: เก็บข้อมูล Scope 3 อย่างเป็นระบบ',
    weight: 1.5,
    criterion_code: 'C1-C3,C10',
    criterion_name_th: 'การจัดทำ GHG inventory',
    standard_reference: 'SBTi',
    display_order: 6
  },

  // Criterion 3: Exclusions ≤ 5% (C5)
  {
    question_id: 'c5-q1',
    question_text: 'กิจกรรมที่คุณ ไม่ได้ นับการปล่อย (เช่น รายจ่ายเล็กๆ น้อยๆ) เป็นแค่ส่วนน้อยมากๆ ของการปล่อยทั้งหมดใช่ไหม?',
    scoring_criteria: 'คะแนน 1-3: ละเว้นหลายอย่าง | 4-6: ละเว้นพอสมควร | 7-8: ละเว้นเล็กน้อย | 9-10: ละเว้น < 5% ของการปล่อยทั้งหมด',
    weight: 1.2,
    criterion_code: 'C5',
    criterion_name_th: 'การละเว้นไม่เกิน 5%',
    standard_reference: 'SBTi',
    display_order: 7
  },
  {
    question_id: 'c5-q2',
    question_text: 'ถ้ามีคนถาม คุณสามารถบอกได้ไหมว่าคุณ ละเว้นอะไร และมั่นใจว่ามันเล็กมากเมื่อเทียบกับส่วนที่คุณนับแล้ว?',
    scoring_criteria: 'คะแนน 1-3: บอกไม่ได้ | 4-6: บอกได้บางส่วน | 7-8: บอกได้ชัดเจน | 9-10: มีเอกสารรองรับและตรวจสอบได้',
    weight: 1.0,
    criterion_code: 'C5',
    criterion_name_th: 'การละเว้นไม่เกิน 5%',
    standard_reference: 'SBTi',
    display_order: 8
  },

  // Criterion 4: Scope 3 materiality (C4)
  {
    question_id: 'c4-q1',
    question_text: 'โดยความรู้สึกของคุณ การปล่อยส่วนใหญ่ของธุรกิจมาจาก ภายนอก (เช่น ซัพพลายเออร์ วัตถุดิบ ขนส่ง) มากกว่าภายในร้าน/โรงงานหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่แน่ใจ | 4-6: น่าจะใช่ | 7-8: แน่ใจว่าส่วนใหญ่มาจากภายนอก | 9-10: มีตัวเลขยืนยันว่า Scope 3 ≥ 40%',
    weight: 1.4,
    criterion_code: 'C4',
    criterion_name_th: 'ความสำคัญของ Scope 3',
    standard_reference: 'SBTi',
    display_order: 9
  },
  {
    question_id: 'c4-q2',
    question_text: 'ถ้าใช่ คุณได้ระบุหรือเขียนไว้ไหมว่า "เป้าหมายการลด" ของคุณครอบคลุมเรื่องเหล่านี้ด้วย?',
    scoring_criteria: 'คะแนน 1-3: ยังไม่ระบุ | 4-6: กล่าวถึงบางส่วน | 7-8: ระบุชัดเจน | 9-10: มีเป้าหมายและแผนการลด Scope 3 ที่เป็นรูปธรรม',
    weight: 1.5,
    criterion_code: 'C4',
    criterion_name_th: 'ความสำคัญของ Scope 3',
    standard_reference: 'SBTi',
    display_order: 10
  },
  {
    question_id: 'c4-q3',
    question_text: 'ในการพูดถึงแผนลดการปล่อย คุณกล่าวถึง ห่วงโซ่อุปทานและขนส่ง ด้วยหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่กล่าวถึง | 4-6: กล่าวถึงบางเรื่อง | 7-8: กล่าวถึงชัดเจน | 9-10: มีแผนงานและตัวชี้วัดสำหรับซัพพลายเชน',
    weight: 1.3,
    criterion_code: 'C4',
    criterion_name_th: 'ความสำคัญของ Scope 3',
    standard_reference: 'SBTi',
    display_order: 11
  },

  // Criterion 5: Scope 3 coverage thresholds (C6-C7)
  {
    question_id: 'c6-q1',
    question_text: 'ในบรรดาการปล่อยทางอ้อม (จากวัตถุดิบ บรรจุภัณฑ์ ขนส่ง ฯลฯ) แผนการลดของคุณครอบคลุม ส่วนใหญ่ หรือไม่ (มากกว่าแค่เรื่องเดียว)?',
    scoring_criteria: 'คะแนน 1-3: ครอบคลุมน้อยมาก | 4-6: ครอบคลุมบางส่วน | 7-8: ครอบคลุมส่วนใหญ่ ≥ 67% | 9-10: ครอบคลุม ≥ 90%',
    weight: 1.4,
    criterion_code: 'C6-C7',
    criterion_name_th: 'การครอบคลุม Scope 3',
    standard_reference: 'SBTi',
    display_order: 12
  },
  {
    question_id: 'c6-q2',
    question_text: 'คุณตั้งใจจะค่อยๆ ขยายให้แผนครอบคลุม เกือบทั้งหมด ของการปล่อยทางอ้อมในระยะยาวไหม?',
    scoring_criteria: 'คะแนน 1-3: ยังไม่มีแผน | 4-6: ตั้งใจแต่ยังไม่ชัดเจน | 7-8: มีแผนขยายเป็นขั้นเป็นตอน | 9-10: มีแผนครอบคลุม 90% ภายในปีเป้าหมาย',
    weight: 1.3,
    criterion_code: 'C6-C7',
    criterion_name_th: 'การครอบคลุม Scope 3',
    standard_reference: 'SBTi',
    display_order: 13
  },

  // Criterion 6: Target timeframes (C16-C17)
  {
    question_id: 'c16-q1',
    question_text: 'คุณมีปีฐาน (ปีอ้างอิง) ในใจไหม เช่น "เทียบจากปี 2023 เราจะลดลงเท่าไร"?',
    scoring_criteria: 'คะแนน 1-3: ไม่มีปีฐาน | 4-6: มีแต่ไม่ชัดเจน | 7-8: มีปีฐานชัดเจน | 9-10: มีปีฐาน ≥ 2015 พร้อมข้อมูล',
    weight: 1.2,
    criterion_code: 'C16-C17',
    criterion_name_th: 'กรอบเวลาของเป้าหมาย',
    standard_reference: 'SBTi',
    display_order: 14
  },
  {
    question_id: 'c16-q2',
    question_text: 'คุณมีเป้าหมายระยะสั้น/กลาง (ภายใน 5–10 ปีข้างหน้า เช่น 2030) ที่ชัดเจนหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่มี | 4-6: มีแต่ไม่ชัด | 7-8: มีเป้าหมายชัดเจน | 9-10: มีเป้าหมายระยะกลางที่วัดผลได้',
    weight: 1.3,
    criterion_code: 'C16-C17',
    criterion_name_th: 'กรอบเวลาของเป้าหมาย',
    standard_reference: 'SBTi',
    display_order: 15
  },
  {
    question_id: 'c16-q3',
    question_text: 'คุณมีปีเป้าหมายระยะยาว ที่อยากเข้าใกล้ net-zero (ไม่เกิน 2050) หรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่มี | 4-6: มีแต่เกิน 2050 | 7-8: มีภายใน 2050 | 9-10: มีภายใน 2045 หรือก่อนหน้า',
    weight: 1.4,
    criterion_code: 'C16-C17',
    criterion_name_th: 'กรอบเวลาของเป้าหมาย',
    standard_reference: 'SBTi',
    display_order: 16
  },

  // Criterion 7: Ambition aligned with 1.5°C (C19-C25)
  {
    question_id: 'c19-q1',
    question_text: 'เป้าหมายของคุณตั้งใจจะลดการปล่อย ส่วนใหญ่ (เช่น มากกว่าครึ่ง) ในระยะยาวหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ลดนิดเดียว | 4-6: ลดพอสมควร | 7-8: ลดมากกว่าครึ่ง | 9-10: ลดเกือบทั้งหมด ≥ 90%',
    weight: 1.5,
    criterion_code: 'C19-C25',
    criterion_name_th: 'ความทะเยอทะยานสอดคล้อง 1.5°C',
    standard_reference: 'SBTi',
    display_order: 17
  },
  {
    question_id: 'c19-q2',
    question_text: 'คุณมีแผนที่จะ ลดซ้ำแล้วซ้ำอีก เป็นรอบๆ (เช่น ทุก 2–3 ปีปรับปรุงเพิ่ม) แทนที่จะทำครั้งเดียวแล้วจบหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่มีแผนต่อเนื่อง | 4-6: ตั้งใจแต่ยังไม่เป็นรูปธรรม | 7-8: มีแผนทบทวนเป็นระยะ | 9-10: มีแผนลดอย่างต่อเนื่องทุกรอบ',
    weight: 1.3,
    criterion_code: 'C19-C25',
    criterion_name_th: 'ความทะเยอทะยานสอดคล้อง 1.5°C',
    standard_reference: 'SBTi',
    display_order: 18
  },
  {
    question_id: 'c19-q3',
    question_text: 'เมื่อจะลงทุนหรือเปลี่ยนวิธีทำงาน คุณเคยถามตัวเองไหมว่า "สิ่งนี้ช่วยลดการปล่อยได้เยอะจริงๆ หรือแค่นิดหน่อย?"',
    scoring_criteria: 'คะแนน 1-3: ไม่เคยคิด | 4-6: เคยคิดบ้าง | 7-8: คิดเป็นประจำ | 9-10: มีเกณฑ์ประเมินผลกระทบก่อนตัดสินใจลงทุน',
    weight: 1.2,
    criterion_code: 'C19-C25',
    criterion_name_th: 'ความทะเยอทะยานสอดคล้อง 1.5°C',
    standard_reference: 'SBTi',
    display_order: 19
  },

  // Criterion 8: Offsets only for residual (C12)
  {
    question_id: 'c12-q1',
    question_text: 'ตอนนี้คุณโฟกัสที่การ ลดการใช้พลังงาน/เชื้อเพลิง/วัตถุดิบ ของตัวเองก่อนการซื้อเครดิตหรือไม่?',
    scoring_criteria: 'คะแนน 1-3: พึ่งเครดิตเป็นหลัก | 4-6: พอๆ กัน | 7-8: โฟกัสการลดก่อน | 9-10: ลดสูงสุดก่อน ใช้เครดิตเฉพาะส่วนที่เหลือ',
    weight: 1.4,
    criterion_code: 'C12',
    criterion_name_th: 'ใช้ offset เฉพาะส่วนที่เหลือ',
    standard_reference: 'SBTi',
    display_order: 20
  },
  {
    question_id: 'c12-q2',
    question_text: 'ถ้าคุณสนับสนุนโครงการปลูกป่าหรือคาร์บอนเครดิต คุณแยกชัดไหมว่ามันเป็น "การช่วยเพิ่มเติม" ไม่ใช่เหตุผลที่จะบอกว่าคุณได้บรรลุเป้าหมายลดการปล่อยแล้ว?',
    scoring_criteria: 'คะแนน 1-3: ไม่แยก นับรวมกัน | 4-6: ค่อนข้างแยก | 7-8: แยกชัดเจน | 9-10: บัญชีแยกชัดเจน ไม่นับเครดิตเป็น progress',
    weight: 1.3,
    criterion_code: 'C12',
    criterion_name_th: 'ใช้ offset เฉพาะส่วนที่เหลือ',
    standard_reference: 'SBTi',
    display_order: 21
  },
  {
    question_id: 'c12-q3',
    question_text: 'คุณเข้าใจไหมว่าในมาตรฐานสากล เครดิตไว้ใช้กับ ส่วนที่เหลือเล็กๆ ที่ลดไม่ได้แล้วจริงๆ?',
    scoring_criteria: 'คะแนน 1-3: ไม่เข้าใจ | 4-6: เข้าใจบางส่วน | 7-8: เข้าใจดี | 9-10: เข้าใจและปฏิบัติตามหลักการนี้อย่างเคร่งครัด',
    weight: 1.2,
    criterion_code: 'C12',
    criterion_name_th: 'ใช้ offset เฉพาะส่วนที่เหลือ',
    standard_reference: 'SBTi',
    display_order: 22
  },

  // Criterion 9: Wider impact & just transition (ISO)
  {
    question_id: 'iso-equity-q1',
    question_text: 'เวลาคุณเปลี่ยนวิธีทำงานเพื่อลดการปล่อย คุณคิดถึงผลกระทบต่อ เกษตรกร/ซัพพลายเออร์/พนักงาน/ชุมชนรอบข้าง หรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่คิด | 4-6: คิดบ้าง | 7-8: คิดเป็นประจำ | 9-10: มีกระบวนการประเมินผลกระทบต่อผู้มีส่วนได้ส่วนเสีย',
    weight: 1.3,
    criterion_code: 'ISO-equity',
    criterion_name_th: 'ผลกระทบกว้างและความเป็นธรรม',
    standard_reference: 'ISO_IWA_42',
    display_order: 23
  },
  {
    question_id: 'iso-equity-q2',
    question_text: 'คุณเคยคุยกับคู่ค้าเรื่องการลดผลกระทบต่อสิ่งแวดล้อม โดยหาทางช่วยกันมากกว่าการบังคับหรือโยนต้นทุนให้เขาฝ่ายเดียวไหม?',
    scoring_criteria: 'คะแนน 1-3: ไม่เคยคุย | 4-6: คุยบ้าง | 7-8: คุยและร่วมมือกัน | 9-10: มีโครงการสนับสนุนคู่ค้าในการลดผลกระทบ',
    weight: 1.2,
    criterion_code: 'ISO-equity',
    criterion_name_th: 'ผลกระทบกว้างและความเป็นธรรม',
    standard_reference: 'ISO_IWA_42',
    display_order: 24
  },
  {
    question_id: 'iso-equity-q3',
    question_text: 'คุณมีการทำอะไรเล็กๆ น้อยๆ เพื่อดูแลธรรมชาติรอบตัว (เช่น ไม่เผา ไม่ปล่อยน้ำเสีย ลดการใช้สารเคมี ฯลฯ) หรือไม่?',
    scoring_criteria: 'คะแนน 1-3: ไม่ทำ | 4-6: ทำบางอย่าง | 7-8: ทำหลายอย่าง | 9-10: มีนโยบายและแผนดูแลสิ่งแวดล้อมครบวงจร',
    weight: 1.1,
    criterion_code: 'ISO-equity',
    criterion_name_th: 'ผลกระทบกว้างและความเป็นธรรม',
    standard_reference: 'ISO_IWA_42',
    display_order: 25
  },

  // Criterion 10: Transparency & reporting (ISO)
  {
    question_id: 'iso-transparency-q1',
    question_text: 'คุณมีการบันทึกสิ่งที่ทำเกี่ยวกับการลดการปล่อย และทบทวนอย่างน้อยปีละครั้งไหม?',
    scoring_criteria: 'คะแนน 1-3: ไม่บันทึก | 4-6: บันทึกบางส่วน | 7-8: บันทึกและทบทวนเป็นประจำ | 9-10: มีระบบติดตามและรายงานอย่างเป็นทางการ',
    weight: 1.3,
    criterion_code: 'ISO-transparency',
    criterion_name_th: 'ความโปร่งใสและการรายงาน',
    standard_reference: 'ISO_IWA_42',
    display_order: 26
  },
  {
    question_id: 'iso-transparency-q2',
    question_text: 'คุณเคยแชร์ข้อมูล (แม้จะง่ายๆ) ให้คนอื่นเห็นไหม เช่น ในเพจ Facebook เว็บไซต์ หรือรายงานสั้นๆ?',
    scoring_criteria: 'คะแนน 1-3: ไม่แชร์ | 4-6: แชร์บางครั้ง | 7-8: แชร์เป็นประจำ | 9-10: มีรายงานสาธารณะและอัพเดทสม่ำเสมอ',
    weight: 1.2,
    criterion_code: 'ISO-transparency',
    criterion_name_th: 'ความโปร่งใสและการรายงาน',
    standard_reference: 'ISO_IWA_42',
    display_order: 27
  },
  {
    question_id: 'iso-transparency-q3',
    question_text: 'เคยมีคนภายนอก (เช่น ที่ปรึกษา มหาวิทยาลัย องค์กรอื่น) ช่วยดูหรือตั้งคำถามกับตัวเลข/คำกล่าวอ้างของคุณบ้างไหม?',
    scoring_criteria: 'คะแนน 1-3: ไม่เคยมี | 4-6: เคยปรึกษา | 7-8: มีที่ปรึกษาดูแลเป็นระยะ | 9-10: มีการตรวจสอบโดยบุคคลภายนอกอย่างเป็นทางการ',
    weight: 1.4,
    criterion_code: 'ISO-transparency',
    criterion_name_th: 'ความโปร่งใสและการรายงาน',
    standard_reference: 'ISO_IWA_42',
    display_order: 28
  }
];

async function cleanOldData() {
  console.log('🗑️  Cleaning old data...');
  
  try {
    // Drop and recreate tables to ensure clean state
    await executeCommand('DROP TABLE IF EXISTS products_survey_answer');
    console.log('  ✅ Dropped products_survey_answer');
    
    await executeCommand('DROP TABLE IF EXISTS products_survey_response');
    console.log('  ✅ Dropped products_survey_response');
    
    await executeCommand('DROP TABLE IF EXISTS products_survey_question');
    console.log('  ✅ Dropped products_survey_question');
    
    console.log('✅ Old data cleaned successfully');
    return true;
  } catch (error) {
    console.error('❌ Error cleaning old data:', error.message);
    throw error;
  }
}

/**
 * Recreate the survey tables from the canonical SQL migration file, since the
 * "ensure database" auto-migration workflow has been removed. This keeps this
 * script self-contained after cleanOldData() drops the tables.
 */
async function recreateTables() {
  console.log('🔨 Recreating tables from sql/create_products_survey_tables.sql...');

  const sqlPath = path.join(__dirname, '../sql/create_products_survey_tables.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Strip line comments and split into individual statements on `;`
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await executeCommand(statement);
  }

  console.log('✅ Tables recreated successfully');
}

async function insertThaiQuestions() {
  console.log('📝 Inserting 28 Thai survey questions...\n');
  
  let successCount = 0;
  
  for (const question of thaiQuestions) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO products_survey_question 
        (id, question_id, question_text, scoring_criteria, weight, is_active,
         criterion_code, criterion_name_th, standard_reference, display_order)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      `;
      
      await executeQuery(sql, [
        id,
        question.question_id,
        question.question_text,
        question.scoring_criteria,
        question.weight,
        question.criterion_code,
        question.criterion_name_th,
        question.standard_reference,
        question.display_order
      ]);
      
      successCount++;
      console.log(`  ✅ [${successCount}/28] ${question.question_id}: ${question.criterion_name_th}`);
    } catch (error) {
      console.error(`  ❌ Failed to insert ${question.question_id}:`, error.message);
      throw error;
    }
  }
  
  console.log(`\n🎉 Successfully inserted ${successCount} Thai questions!`);
  
  // Print summary by criterion
  console.log('\n📊 Summary by Criterion:');
  const criteriaMap = {};
  thaiQuestions.forEach(q => {
    if (!criteriaMap[q.criterion_code]) {
      criteriaMap[q.criterion_code] = {
        name: q.criterion_name_th,
        standard: q.standard_reference,
        count: 0
      };
    }
    criteriaMap[q.criterion_code].count++;
  });
  
  Object.entries(criteriaMap).forEach(([code, info]) => {
    console.log(`  ${code} (${info.standard}): ${info.name} - ${info.count} questions`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting Thai Questions Initialization\n');
    console.log('This will:');
    console.log('  1. Delete all existing survey data');
    console.log('  2. Drop and recreate survey tables');
    console.log('  3. Insert 28 new Thai questions\n');
    
    // Clean old data
    await cleanOldData();
    
    console.log('\n⏳ Recreating tables...\n');
    
    // Recreate tables from the canonical SQL migration file
    await recreateTables();
    
    console.log('✅ All tables are ready!\n');
    
    // Insert new Thai questions
    await insertThaiQuestions();
    
    console.log('\n✅ Initialization complete!');
    console.log('You can now test the API endpoints.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanOldData, insertThaiQuestions };
