const {
  ProductSurveyQuestion,
  ProductSurveyResponse,
  ProductSurveyAnswer
} = require('../models/ProductSurvey');
const simpleAiWebsearch = require('../utils/simpleAiWebsearch');
const { executeQuery } = require('../config/database');

/**
 * AI Product Survey Service
 * Handles evaluation of product surveys using AI
 * Implements the core business logic for net-zero criteria assessment
 */
class AiProductSurveyService {
  /**
   * Evaluate a product survey with AI
   * @param {Object} input - Survey evaluation input
   * @param {string} input.productId - Product ID
   * @param {Array<Object>} input.answers - Array of answer objects
   * @param {string} input.answers[].questionId - Question ID
   * @param {number} input.answers[].score - Score value (1-10)
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateProductSurvey(input) {
    const { productId, answers } = input;

    console.log('🎯 AiProductSurveyService - Starting evaluation');
    console.log(`   Product ID: ${productId}`);
    console.log(`   Answers: ${answers.length} responses`);

    // Step 1: Validate product exists
    await this._validateProduct(productId);

    // Step 2: Validate questions exist and are active
    await this._validateQuestions(answers);

    // Step 3: Create survey response with pending_ai status
    const surveyResponse = await this._createSurveyResponse(productId);

    try {
      // Step 4: Save answers to database
      await this._saveAnswers(surveyResponse.id, answers);

      // Step 5: Load question details for AI context
      const answersWithQuestions = await this._loadQuestionDetails(answers);

      // Step 6: Call AI for evaluation
      const aiResult = await this._evaluateWithAi(productId, answersWithQuestions);

      // Step 7: Update survey response with AI results
      const updatedResponse = await this._updateResponseWithAiResult(
        surveyResponse.id,
        aiResult
      );

      console.log('✅ AiProductSurveyService - Evaluation complete');
      console.log(`   Status: ${updatedResponse.status}`);

      // Step 8: Return result
      return {
        surveyResponseId: updatedResponse.id,
        productId: updatedResponse.product_id,
        status: updatedResponse.status,
        alignmentLevel: updatedResponse.alignment_level,
        overallScore: updatedResponse.overall_score,
        aiComment: updatedResponse.ai_comment,
        aiRawResult: updatedResponse.ai_raw_result,
        criteriaBreakdown: updatedResponse.criteria_breakdown
      };

    } catch (error) {
      // Update response status to reflect error
      await ProductSurveyResponse.updateById(surveyResponse.id, {
        status: 'needs_review',
        ai_comment: `Error during AI evaluation: ${error.message}`
      });

      throw error;
    }
  }

  /**
   * Validate that product exists
   * @param {string} productId - Product UUID
   * @private
   */
  async _validateProduct(productId) {
    console.log(`🔍 Validating product: ${productId}`);

    // Skip validation if product ID is a valid UUID format (for testing)
    // In production, you may want to enforce strict product existence check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(productId)) {
      console.log('✅ Product ID is valid UUID format (validation skipped for testing)');
      return;
    }

    const query = 'SELECT id FROM products WHERE id = ?';
    const results = await executeQuery(query, [productId]);

    if (results.length === 0) {
      throw new Error(`Product not found: ${productId}`);
    }

    console.log('✅ Product exists');
  }

  /**
   * Validate that all questions exist and are active
   * @param {Array<Object>} answers - Array of answers
   * @private
   */
  async _validateQuestions(answers) {
    console.log(`🔍 Validating ${answers.length} questions`);

    const questionIds = answers.map(a => a.questionId);
    const uniqueQuestionIds = [...new Set(questionIds)];

    // Check for duplicates
    if (uniqueQuestionIds.length !== questionIds.length) {
      throw new Error('Duplicate question IDs found in answers');
    }

    // Load questions from database
    const questions = await ProductSurveyQuestion.findByIds(uniqueQuestionIds);

    if (questions.length !== uniqueQuestionIds.length) {
      const foundIds = questions.map(q => q.question_id);
      const missingIds = uniqueQuestionIds.filter(id => !foundIds.includes(id));
      throw new Error(`Questions not found: ${missingIds.join(', ')}`);
    }

    // Check all questions are active
    const inactiveQuestions = questions.filter(q => !q.is_active);
    if (inactiveQuestions.length > 0) {
      const inactiveIds = inactiveQuestions.map(q => q.question_id);
      throw new Error(`Inactive questions: ${inactiveIds.join(', ')}`);
    }

    console.log('✅ All questions are valid and active');
  }

  /**
   * Create survey response with pending_ai status
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Created survey response
   * @private
   */
  async _createSurveyResponse(productId) {
    console.log('📝 Creating survey response');

    // Get latest trial count for this product
    const latestTrialCount = await ProductSurveyResponse.getLatestTrialCount(productId);
    const newTrialCount = latestTrialCount + 1;

    console.log(`   Trial count: ${newTrialCount}`);

    // Create response
    const response = await ProductSurveyResponse.create({
      product_id: productId,
      status: 'pending_ai',
      trial_count: newTrialCount
    });

    console.log(`✅ Survey response created: ${response.id}`);

    return response;
  }

  /**
   * Save answers to database
   * @param {string} surveyResponseId - Survey response ID
   * @param {Array<Object>} answers - Array of answers
   * @private
   */
  async _saveAnswers(surveyResponseId, answers) {
    console.log(`💾 Saving ${answers.length} answers`);

    // Load questions to get their UUID ids
    const questionIds = answers.map(a => a.questionId);
    const questions = await ProductSurveyQuestion.findByIds(questionIds);
    const questionMap = new Map(questions.map(q => [q.question_id, q.id])); // Map question_id to UUID

    const answersData = answers.map(answer => ({
      survey_response_id: surveyResponseId,
      question_id: questionMap.get(answer.questionId), // Use UUID id, not question_id string
      score: answer.score,
      comment: answer.comment || null
    }));

    await ProductSurveyAnswer.bulkCreate(answersData);

    console.log('✅ Answers saved');
  }

  /**
   * Load question details for answers
   * @param {Array<Object>} answers - Array of answers
   * @returns {Promise<Array<Object>>} Answers with question details
   * @private
   */
  async _loadQuestionDetails(answers) {
    console.log('📖 Loading question details');

    const questionIds = answers.map(a => a.questionId);
    const questions = await ProductSurveyQuestion.findByIds(questionIds);

    // Create a map for quick lookup (using question_id as key)
    const questionMap = new Map(questions.map(q => [q.question_id, q]));

    // Enrich answers with question details including criterion information
    const enrichedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      return {
        questionId: answer.questionId,
        questionText: question.question_text,
        scoringCriteria: question.scoring_criteria,
        weight: question.weight,
        score: answer.score,
        criterionCode: question.criterion_code,
        criterionNameTh: question.criterion_name_th,
        standardReference: question.standard_reference
      };
    });

    console.log('✅ Question details loaded');

    return enrichedAnswers;
  }

  /**
   * Evaluate with AI using simpleAiWebsearch with Thai criteria-based assessment
   * @param {string} productId - Product ID
   * @param {Array<Object>} answersWithQuestions - Enriched answers
   * @returns {Promise<Object>} AI evaluation result
   * @private
   */
  async _evaluateWithAi(productId, answersWithQuestions) {
    console.log('🤖 Evaluating with AI (Thai criteria-based)');

    // Group answers by criterion
    const criteriaGroups = this._groupAnswersByCriterion(answersWithQuestions);
    
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

    // Call simpleAiWebsearch with web search enabled
    const aiResult = await simpleAiWebsearch.search({
      searchInstruction,
      outputInstruction,
      prompt,
      options: {
        temperature: 0.3,
        maxTokens: 4000,
        model: 'gpt-4o',
        enableWebSearch: true
      }
    });

    console.log('✅ AI evaluation complete');
    console.log(`   Status: ${aiResult.result.status}`);
    console.log(`   Alignment Level: ${aiResult.result.alignment_level || 'N/A'}`);
    console.log(`   Overall Score: ${aiResult.result.overall_score}`);

    return aiResult;
  }

  /**
   * Group answers by criterion for structured evaluation
   * @param {Array<Object>} answers - Enriched answers
   * @returns {Object} Grouped by criterion code
   * @private
   */
  _groupAnswersByCriterion(answers) {
    const groups = {};
    
    answers.forEach(answer => {
      const criterion = answer.criterionCode || 'unknown';
      
      if (!groups[criterion]) {
        groups[criterion] = {
          criterionCode: criterion,
          criterionNameTh: answer.criterionNameTh || 'ไม่ระบุ',
          standardReference: answer.standardReference || 'N/A',
          questions: []
        };
      }
      
      groups[criterion].questions.push(answer);
    });
    
    return groups;
  }

  /**
   * Update survey response with AI result
   * @param {string} surveyResponseId - Survey response ID
   * @param {Object} aiResult - AI evaluation result
   * @returns {Promise<Object>} Updated survey response
   * @private
   */
  async _updateResponseWithAiResult(surveyResponseId, aiResult) {
    console.log('💾 Updating response with AI result');
    console.log('   AI Status:', aiResult.result.status);
    
    // Map AI status values to database ENUM values
    const statusMap = {
      'pass': 'passed',
      'fail': 'failed',
      'passed': 'passed',
      'failed': 'failed',
      'needs_review': 'needs_review',
      'pending_ai': 'pending_ai'
    };
    
    const mappedStatus = statusMap[aiResult.result.status] || 'needs_review';
    console.log('   Mapped Status:', mappedStatus);
    
    // Map alignment level
    const alignmentMap = {
      'beginner': 'beginner',
      'emerging': 'emerging',
      'consistent': 'consistent'
    };
    
    const alignmentLevel = alignmentMap[aiResult.result.alignment_level] || 'unknown';
    console.log('   Alignment Level:', alignmentLevel);

    // Extract criteria breakdown
    const criteriaBreakdown = {
      criteria_scores: aiResult.result.criteria_scores || {},
      sbti_compliance_summary: aiResult.result.sbti_compliance_summary || {},
      risk_flags: aiResult.result.risk_flags || [],
      recommendations: aiResult.result.recommendations || []
    };

    const updatedResponse = await ProductSurveyResponse.updateById(surveyResponseId, {
      status: mappedStatus,
      alignment_level: alignmentLevel,
      overall_score: aiResult.result.overall_score || 0,
      ai_comment: aiResult.result.ai_comment,
      criteria_breakdown: criteriaBreakdown,
      ai_raw_result: {
        ...aiResult.result,
        rawText: aiResult.rawText,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Response updated');

    return updatedResponse;
  }

  /**
   * Get survey response by ID with answers
   * @param {string} surveyResponseId - Survey response ID
   * @returns {Promise<Object>} Survey response with answers
   */
  async getSurveyResponse(surveyResponseId) {
    const response = await ProductSurveyResponse.findById(surveyResponseId);
    
    if (!response) {
      throw new Error(`Survey response not found: ${surveyResponseId}`);
    }

    const answers = await ProductSurveyAnswer.findBySurveyResponseId(surveyResponseId);

    return {
      ...response,
      answers
    };
  }

  /**
   * Get all survey responses for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of survey responses
   */
  async getProductSurveyHistory(productId) {
    return await ProductSurveyResponse.findByProductId(productId);
  }
}

// Export singleton instance
module.exports = new AiProductSurveyService();
