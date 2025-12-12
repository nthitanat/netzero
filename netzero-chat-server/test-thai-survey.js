/**
 * Test script for Thai Survey API with 28 questions
 */

const BASE_URL = 'http://localhost:3004/api/v1';

// Sample answers for all 28 questions (beginner level responses)
const sampleAnswers = [
  // C14: Net-zero commitment (3 questions)
  { questionId: 'c14-q1', answer: 'ยังไม่มีเป้าหมายที่ชัดเจน แต่กำลังศึกษา', score: 3 },
  { questionId: 'c14-q2', answer: 'ครอบคลุมเฉพาะ Scope 1 และ 2', score: 4 },
  { questionId: 'c14-q3', answer: 'มีแผนคร่าวๆ แต่ยังไม่ได้อนุมัติอย่างเป็นทางการ', score: 4 },
  
  // C1-C3: GHG inventory (3 questions)
  { questionId: 'c1-q1', answer: 'คำนวณเฉพาะ Scope 1 และบางส่วนของ Scope 2', score: 5 },
  { questionId: 'c1-q2', answer: 'ใช้ข้อมูลประมาณการ ยังไม่มีข้อมูลที่แม่นยำ', score: 4 },
  { questionId: 'c1-q3', answer: 'ยังไม่ได้ตรวจสอบโดยบุคคลที่สาม', score: 2 },
  
  // C5: Exclusions (2 questions)
  { questionId: 'c5-q1', answer: 'ยังไม่แน่ใจว่าละเว้นอะไรบ้าง ไม่มีการคำนวณ', score: 2 },
  { questionId: 'c5-q2', answer: 'ไม่มีเอกสารอธิบาย', score: 1 },
  
  // C4: Scope 3 materiality (3 questions)
  { questionId: 'c4-q1', answer: 'ประมาณว่า Scope 3 น่าจะมีบ้าง แต่ยังไม่ได้คำนวณ', score: 3 },
  { questionId: 'c4-q2', answer: 'รู้ประเภทบางส่วน เช่น การจัดส่งสินค้า', score: 4 },
  { questionId: 'c4-q3', answer: 'ไม่แน่ใจว่าต้องรวม Scope 3 หรือไม่', score: 2 },
  
  // C6-C7: Scope 3 coverage (2 questions)
  { questionId: 'c6-q1', answer: 'คำนวณได้ประมาณ 30% ของ Scope 3 ทั้งหมด', score: 4 },
  { questionId: 'c6-q2', answer: 'ครอบคลุมเฉพาะ category ที่คำนวณง่าย เช่น การขนส่ง', score: 4 },
  
  // C16-C17: Target timeframes (3 questions)
  { questionId: 'c16-q1', answer: 'ยังไม่มีเป้าหมายระยะสั้น มีแต่เป้าหมายระยะยาว', score: 3 },
  { questionId: 'c16-q2', answer: 'ตั้งเป้าหมายในปี 2060', score: 4 },
  { questionId: 'c16-q3', answer: 'ยังไม่มีเป้าหมายระยะสั้น', score: 2 },
  
  // C19-C25: 1.5°C ambition (3 questions)
  { questionId: 'c19-q1', answer: 'ตั้งเป้าลด 20% ภายใน 10 ปี', score: 4 },
  { questionId: 'c19-q2', answer: 'ไม่แน่ใจว่าสอดคล้องกับ 1.5°C หรือไม่', score: 3 },
  { questionId: 'c19-q3', answer: 'ยังไม่ได้เปรียบเทียบกับมาตรฐานสากล', score: 2 },
  
  // C12: Offsets for residual only (3 questions)
  { questionId: 'c12-q1', answer: 'วางแผนจะใช้ carbon offset ประมาณ 50% ของการลด', score: 3 },
  { questionId: 'c12-q2', answer: 'ยังไม่มีแผนการลดก่อน', score: 2 },
  { questionId: 'c12-q3', answer: 'พิจารณาใช้ offset ในระยะแรก', score: 3 },
  
  // ISO-equity: Wider impact (3 questions)
  { questionId: 'iso-equity-q1', answer: 'ยังไม่ได้พิจารณาผลกระทบต่อชุมชน', score: 2 },
  { questionId: 'iso-equity-q2', answer: 'ไม่มีแผนเรื่องความเป็นธรรมในการเปลี่ยนผ่าน', score: 2 },
  { questionId: 'iso-equity-q3', answer: 'ยังไม่ได้มีส่วนร่วมกับ stakeholders', score: 2 },
  
  // ISO-transparency: Reporting (3 questions)
  { questionId: 'iso-transparency-q1', answer: 'ไม่เคยรายงานข้อมูล carbon footprint', score: 1 },
  { questionId: 'iso-transparency-q2', answer: 'ยังไม่มีแผนจะเปิดเผยข้อมูล', score: 2 },
  { questionId: 'iso-transparency-q3', answer: 'ไม่มีเอกสารหรือรายงาน', score: 1 }
];

async function testGetQuestions() {
  console.log('\n📋 Testing GET /api/v1/products/surveys/questions\n');
  
  const response = await fetch(`${BASE_URL}/products/surveys/questions`);
  const data = await response.json();
  
  if (data.success && data.data.questions.length === 28) {
    console.log('✅ Questions endpoint works!');
    console.log(`   Found ${data.data.questions.length} questions`);
    console.log(`   Criteria groups: ${data.data.questionCount} total\n`);
    return true;
  } else {
    console.log('❌ Questions endpoint failed:', data);
    return false;
  }
}

async function testSubmitSurvey() {
  console.log('📝 Testing POST /api/v1/products/:productId/surveys\n');
  console.log('⏳ Submitting survey with 28 beginner-level answers...\n');
  console.log('🤖 AI evaluation in progress (this may take 30-60 seconds)...\n');
  
  // Generate a UUID for the product (surveys don't require products to exist)
  const productId = 'c7f4e2a3-9b1d-4f8e-a5c3-1e7d9f3b2c4a';
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/products/${productId}/surveys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: sampleAnswers })
    });
    
    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (data.success) {
      console.log(`✅ Survey submitted successfully! (took ${duration}s)\n`);
      console.log('📊 AI Evaluation Results:\n');
      console.log(`   Response ID: ${data.data.surveyResponseId}`);
      console.log(`   Alignment Level: ${data.data.alignmentLevel || 'N/A'}`);
      console.log(`   Overall Score: ${data.data.overallScore || 'N/A'}/100`);
      console.log(`   AI Comment: ${data.data.aiComment?.substring(0, 150)}...`);
      
      if (data.data.criteriaBreakdown) {
        console.log('\n   📈 Criteria Breakdown:');
        const breakdown = data.data.criteriaBreakdown;
        
        if (breakdown.criteria_scores) {
          console.log('\n   Individual Criteria Scores:');
          Object.entries(breakdown.criteria_scores).forEach(([code, score]) => {
            console.log(`      ${code}: ${score}/10`);
          });
        }
        
        if (breakdown.sbti_compliance_summary) {
          console.log('\n   🎯 SBTi Compliance Summary:');
          Object.entries(breakdown.sbti_compliance_summary).forEach(([key, value]) => {
            console.log(`      ${key}: ${JSON.stringify(value)}`);
          });
        }
        
        if (breakdown.risk_flags && breakdown.risk_flags.length > 0) {
          console.log('\n   ⚠️  Risk Flags:');
          breakdown.risk_flags.forEach(flag => {
            console.log(`      - ${flag}`);
          });
        }
      }
      
      return data.data.surveyResponseId;
    } else {
      console.log('❌ Survey submission failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Survey submission error:', error.message);
    return null;
  }
}

async function testGetSurveyDetails(responseId) {
  console.log(`\n📄 Testing GET /api/v1/products/surveys/${responseId}\n`);
  
  const response = await fetch(`${BASE_URL}/products/surveys/${responseId}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Survey details retrieved!');
    console.log(`   Product ID: ${data.data.product_id}`);
    console.log(`   Total Answers: ${data.data.answers?.length || 0}`);
    console.log(`   Alignment: ${data.data.alignment_level || 'N/A'}`);
    console.log(`   Score: ${data.data.overall_score || 'N/A'}/100`);
    return true;
  } else {
    console.log('❌ Get survey details failed:', data);
    return false;
  }
}

async function testGetProductSurveyHistory() {
  console.log('\n📚 Testing GET /api/v1/products/{productId}/surveys\n');
  
  const productId = 'c7f4e2a3-9b1d-4f8e-a5c3-1e7d9f3b2c4a';
  const response = await fetch(`${BASE_URL}/products/${productId}/surveys`);
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Survey history retrieved!');
    console.log(`   Total submissions: ${data.data.length}`);
    if (data.data.length > 0) {
      console.log(`   Latest submission: ${data.data[0].response_id}`);
      console.log(`   Alignment: ${data.data[0].alignment_level || 'N/A'}`);
    }
    return true;
  } else {
    console.log('❌ Get survey history failed:', data);
    return false;
  }
}

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🧪 Testing Thai Survey API (28 Questions)              ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    // Test 1: Get questions
    const test1 = await testGetQuestions();
    if (!test1) {
      console.log('\n❌ Stopping tests - GET questions failed\n');
      return;
    }
    
    // Test 2: Submit survey
    const responseId = await testSubmitSurvey();
    if (!responseId) {
      console.log('\n❌ Stopping tests - POST survey failed\n');
      return;
    }
    
    // Test 3: Get survey details
    await testGetSurveyDetails(responseId);
    
    // Test 4: Get survey history
    await testGetProductSurveyHistory();
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ All Tests Completed!                                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.log('\n❌ Test suite error:', error.message, '\n');
  }
}

// Run tests
runAllTests();
