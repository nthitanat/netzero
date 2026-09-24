function groupAnswersByCriterion(answers) {
  const groups = {};
  for (const answer of answers) {
    const criterionCode = answer.criterionCode || 'unknown';
    if (!groups[criterionCode]) {
      groups[criterionCode] = {
        criterionNameTh: answer.criterionNameTh || 'ไม่ระบุ',
        standardReference: answer.standardReference || 'N/A',
        questions: []
      };
    }
    groups[criterionCode].questions.push(answer);
  }
  return groups;
}

function buildEvaluationPrompt({ productId, answersWithQuestions }) {
  const criteriaGroups = groupAnswersByCriterion(answersWithQuestions);
  // Build Thai search instruction with ISO/SBTi context
  const searchInstruction = `คุณเป็นผู้เชี่ยวชาญด้านมาตรฐาน net-zero สำหรับ SME ในประเทศไทย
  ที่มีความรู้เชิงลึกเรื่อง:
  - ISO IWA 42:2022 (Net zero guidelines)
  - SBTi Corporate Net-Zero Standard v1.3 (criteria C1-C25)

  สำคัญ: ใช้การค้นหาเว็บเพื่อหาข้อมูลล่าสุดเกี่ยวกับ:
  - มาตรฐาน SDG (Sustainable Development Goals) ล่าสุด
  - เกณฑ์ SBTi (Science Based Targets initiative) ปัจจุบัน
  - มาตรฐาน ISO net-zero (ISO 14068-1, ISO 14064 ฯลฯ)
  - แนวปฏิบัติที่ดีสำหรับ SME ในปัจจุบัน
  - การรับรองด้านความยั่งยืนที่เป็นที่ยอมรับ

  งานของคุณ: ประเมิน SME ตามคำตอบแบบสำรวจ 28 ข้อ ที่แบ่งเป็น 10 เกณฑ์หลัก

  เกณฑ์การให้คะแนนแต่ละข้อ (1-10):
  - 1-3: แทบไม่มี/ยังไม่เริ่ม - ไม่มีการดำเนินการหรือการตระหนักรู้
  - 4-6: เริ่มทำบ้าง แต่ยังไม่ชัด/ไม่ครอบคลุม - มีความพยายามบางส่วนแต่ยังไม่เป็นระบบ
  - 7-8: ทำค่อนข้างดี/ครอบคลุมหลักๆ - มีการดำเนินการที่ดีและครอบคลุมส่วนสำคัญ
  - 9-10: สอดคล้องกับมาตรฐานชัดเจน/มีหลักฐาน - ปฏิบัติตามมาตรฐานสากลและมีหลักฐานรองรับ

  Hard checks ที่ต้องตรวจ (ถ้ามีข้อมูล):
  - C5: Exclusions ≤ 5% (ส่วนที่ละเว้นไม่เกิน 5%)
  - C4: ถ้า Scope 3 ≥ 40% ของการปล่อยทั้งหมด → ต้องอยู่ใน target
  - C6-C7: Coverage Scope 3 ≥ 67% (near-term), ≥ 90% (long-term)
  - C16-C17: Base year ≥ 2015, near-term 5-10 ปี, net-zero ≤ 2050

  ระดับความสอดคล้อง:
  - "beginner": คะแนนเฉลี่ยส่วนใหญ่ < 5 - ยังอยู่ในระดับเริ่มต้น กำลังเรียนรู้
  - "emerging": เกณฑ์ SBTi สำคัญ (C14, C1-C3, C16-C17) ≥ 6 แต่ยังไม่ผ่าน hard checks ทั้งหมด - มีพื้นฐานดีแต่ยังต้องพัฒนา
  - "consistent": เกณฑ์ SBTi ทั้งหมด ≥ 8 และผ่าน hard checks ที่สำคัญ - สอดคล้องกับมาตรฐานสากล

  ให้วิเคราะห์แต่ละเกณฑ์และให้คำแนะนำที่เป็นรูปธรรมในภาษาไทย`;

  // Build output instruction for Thai response with detailed breakdown
  const outputInstruction = `คุณต้องตอบเป็น JSON เท่านั้น ในรูปแบบนี้:
  {
    "status": "pass" | "fail" | "needs_review",
    "overall_score": 0-100,
    "alignment_level": "beginner" | "emerging" | "consistent",
    "ai_comment": "คำอธิบาย 3-5 ประโยคภาษาไทย สรุปผลการประเมิน จุดแข็ง จุดที่ต้องพัฒนา และคำแนะนำหลัก",
    "criteria_scores": {
  "criterion_code_1": {
    "score": 7.5,
    "comment": "คำอธิบายสั้นๆ ภาษาไทย"
  },
  "criterion_code_2": {
    "score": 5.2,
    "comment": "คำอธิบายสั้นๆ ภาษาไทย",
    "hard_check_passed": false,
    "hard_check_note": "เหตุผลที่ไม่ผ่าน"
  }
    },
    "sbti_compliance_summary": {
  "C14_commitment": "met" | "partial" | "not_met",
  "C1_C3_inventory": "met" | "partial" | "not_met",
  "C5_exclusions": "met" | "partial" | "not_met"
    },
    "risk_flags": ["ความเสี่ยง 1", "ความเสี่ยง 2"],
    "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", "คำแนะนำ 3"]
  }

  เกณฑ์การให้ status:
  - "pass": overall_score ≥ 70, เกณฑ์สำคัญผ่านหมด, risk_flags น้อย
  - "fail": overall_score < 50, มีปัญหาสำคัญหลายจุด, risk_flags เยอะ
  - "needs_review": overall_score 50-69, บางเกณฑ์ผ่านบางเกณฑ์ไม่ผ่าน

  ในการคำนวณ overall_score: ใช้ค่าเฉลี่ยถ่วนน้ำหนักจากคะแนนแต่ละข้อ
  ในการกำหนด alignment_level: ดูจากคะแนนเฉลี่ยของแต่ละเกณฑ์และการผ่าน hard checks`;

  // Build detailed prompt with criteria grouping
  const criteriaDetails = Object.entries(criteriaGroups).map(([criterionCode, group]) => {
    const questionsList = group.questions.map(q => 
      `  - ${q.questionText} (คะแนน: ${q.score}/10)\n    เกณฑ์: ${q.scoringCriteria}`
    ).join('\n');
    
    return `[${criterionCode}: ${group.criterionNameTh} (${group.standardReference})]
  ${questionsList}`;
  }).join('\n\n');

  const prompt = `ข้อมูลสินค้า ID: ${productId}

  คำตอบแบบสำรวจ (${answersWithQuestions.length} ข้อ แบ่งเป็น ${Object.keys(criteriaGroups).length} เกณฑ์):

  ${criteriaDetails}

  ให้วิเคราะห์และประเมินตามรูปแบบ JSON ที่กำหนด พร้อมให้คำแนะนำที่เป็นรูปธรรมในภาษาไทย`;
  return { searchInstruction, outputInstruction, prompt };
}

module.exports = { buildEvaluationPrompt };
