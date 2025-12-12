# 🧑‍💼 Client-Side Integration Guide
## Thai Net-Zero Survey API (28 Questions)

### 📋 Overview

This API provides a comprehensive SME net-zero assessment based on **ISO IWA 42:2022** and **SBTi Corporate Net-Zero Standard v1.3**. The survey consists of 28 Thai-language questions across 10 criteria groups.

**Base URL:** `http://localhost:3004/api/v1`

---

## 🔌 API Endpoints

### 1. Get Survey Questions

Retrieve all 28 active Thai survey questions with criteria mapping.

**Endpoint:** `GET /products/surveys/questions`

**Response Example:**
```json
{
  "success": true,
  "message": "Survey questions retrieved successfully",
  "data": {
    "questionCount": 28,
    "questions": [
      {
        "id": "61a09613-762d-40d8-af8c-23432f16d74e",
        "questionId": "c14-q1",
        "questionText": "ธุรกิจของคุณมีการเขียน \"เป้าหมายระยะยาว\" เรื่องการลดผลกระทบต่อสภาพภูมิอากาศหรือไม่ (เช่น net-zero ภายในปี…)?",
        "scoringCriteria": "คะแนน 1-3: ไม่มีเป้าหมาย | 4-6: มีเป้าหมายแต่ไม่ชัดเจน | 7-8: มีเป้าหมายชัดเจน | 9-10: มีเป้าหมายที่ระบุปีและครอบคลุมทั้งธุรกิจ",
        "weight": "1.50",
        "criterionCode": "C14",
        "criterionNameTh": "การตั้งเป้า net-zero และขอบเขต",
        "standardReference": "SBTi",
        "displayOrder": 1
      }
      // ... 27 more questions
    ]
  },
  "timestamp": "2025-12-03T08:30:00.000Z"
}
```

**Client Integration:**
```javascript
async function fetchSurveyQuestions() {
  const response = await fetch(`${API_BASE}/products/surveys/questions`);
  const data = await response.json();
  
  if (data.success) {
    // Group questions by criterion for better UX
    const groupedQuestions = data.data.questions.reduce((acc, q) => {
      const key = q.criterionCode;
      if (!acc[key]) {
        acc[key] = {
          criterionCode: key,
          criterionNameTh: q.criterionNameTh,
          standardReference: q.standardReference,
          questions: []
        };
      }
      acc[key].questions.push(q);
      return acc;
    }, {});
    
    return Object.values(groupedQuestions);
  }
}
```

---

### 2. Submit Survey

Submit answers for AI evaluation (all 28 questions required).

**Endpoint:** `POST /products/:productId/surveys`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "c14-q1",
      "answer": "ยังไม่มีเป้าหมายที่ชัดเจน แต่กำลังศึกษา",
      "score": 3
    },
    {
      "questionId": "c14-q2",
      "answer": "ครอบคลุมเฉพาะ Scope 1 และ 2",
      "score": 4
    }
    // ... all 28 answers
  ]
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Survey evaluated successfully",
  "data": {
    "surveyResponseId": "634cc03f-53fa-4912-88c0-17fab107b03d",
    "productId": "c7f4e2a3-9b1d-4f8e-a5c3-1e7d9f3b2c4a",
    "status": "needs_review",
    "alignmentLevel": "beginner",
    "overallScore": 38,
    "aiComment": "โดยรวม SME ยังอยู่ในระดับเริ่มต้น (beginner) ด้าน net‑zero และ SBTi มีความพยายามบางส่วนแต่ยังไม่เป็นระบบ...",
    "criteriaBreakdown": {
      "criteria_scores": {
        "C14_target_year": {
          "score": 4,
          "comment": "มีปีเป้าหมายแต่ไม่ชัดเจน"
        },
        "C1_C3_inventory_list": {
          "score": 5,
          "comment": "ลิสต์กิจกรรมหลักบางส่วนแล้ว"
        }
        // ... all 28 criteria scores
      },
      "sbti_compliance_summary": {
        "C14_commitment": "not_met",
        "C1_C3_inventory": "partial",
        "C5_exclusions": "not_met"
      },
      "risk_flags": [
        "ไม่มีเป้าหมาย net-zero ชัดเจน",
        "Scope 3 ไม่ถูกนับหรือวางแผน"
      ],
      "recommendations": [
        "ตั้งเป้าหมาย net-zero ระยะสั้น (2030) และระยะยาว (≤2050) ให้ชัดเจน",
        "จัดทำ GHG inventory ครอบคลุม Scope 1-3"
      ]
    },
    "aiRawResult": { /* Full AI response */ }
  },
  "timestamp": "2025-12-03T08:30:00.000Z"
}
```

**Client Integration:**
```javascript
async function submitSurvey(productId, answers) {
  // Show loading indicator (AI takes 10-60 seconds)
  setLoading(true, "กำลังประเมินผลด้วย AI... กรุณารอสักครู่");
  
  const response = await fetch(`${API_BASE}/products/${productId}/surveys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  
  const data = await response.json();
  setLoading(false);
  
  if (data.success) {
    return {
      responseId: data.data.surveyResponseId,
      alignmentLevel: data.data.alignmentLevel,    // 'beginner' | 'emerging' | 'consistent' | 'unknown'
      overallScore: data.data.overallScore,        // 0-100
      aiComment: data.data.aiComment,              // Thai summary
      criteriaBreakdown: data.data.criteriaBreakdown,
      sbtiCompliance: data.data.criteriaBreakdown.sbti_compliance_summary,
      riskFlags: data.data.criteriaBreakdown.risk_flags,
      recommendations: data.data.criteriaBreakdown.recommendations
    };
  } else {
    throw new Error(data.message);
  }
}
```

---

### 3. Get Survey Details

Retrieve a specific survey response with all answers.

**Endpoint:** `GET /products/surveys/:surveyResponseId`

**Response Example:**
```json
{
  "success": true,
  "message": "Survey response retrieved successfully",
  "data": {
    "id": "634cc03f-53fa-4912-88c0-17fab107b03d",
    "product_id": "c7f4e2a3-9b1d-4f8e-a5c3-1e7d9f3b2c4a",
    "status": "needs_review",
    "alignment_level": "beginner",
    "overall_score": 38,
    "ai_comment": "โดยรวม SME ยังอยู่ในระดับเริ่มต้น...",
    "criteria_breakdown": { /* Full breakdown */ },
    "trial_count": 1,
    "created_at": "2025-12-03T08:30:00.000Z",
    "updated_at": "2025-12-03T08:30:10.000Z",
    "answers": [
      {
        "id": "answer-uuid-1",
        "question_id": "question-uuid-1",
        "question_text": "ธุรกิจของคุณมีการเขียน \"เป้าหมายระยะยาว\"...",
        "answer": "ยังไม่มีเป้าหมายที่ชัดเจน",
        "score": 3
      }
      // ... all 28 answers
    ]
  },
  "timestamp": "2025-12-03T08:31:00.000Z"
}
```

**Client Integration:**
```javascript
async function fetchSurveyDetails(responseId) {
  const response = await fetch(`${API_BASE}/products/surveys/${responseId}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      ...data.data,
      // Parse JSON fields if needed
      criteriaBreakdown: typeof data.data.criteria_breakdown === 'string' 
        ? JSON.parse(data.data.criteria_breakdown) 
        : data.data.criteria_breakdown
    };
  }
}
```

---

### 4. Get Survey History

Get all survey submissions for a product.

**Endpoint:** `GET /products/:productId/surveys`

**Response Example:**
```json
{
  "success": true,
  "message": "Survey history retrieved successfully",
  "data": [
    {
      "response_id": "634cc03f-53fa-4912-88c0-17fab107b03d",
      "product_id": "c7f4e2a3-9b1d-4f8e-a5c3-1e7d9f3b2c4a",
      "status": "needs_review",
      "alignment_level": "beginner",
      "overall_score": 38,
      "ai_comment": "โดยรวม SME ยังอยู่ในระดับเริ่มต้น...",
      "created_at": "2025-12-03T08:30:00.000Z"
    }
    // ... more submissions
  ],
  "timestamp": "2025-12-03T08:32:00.000Z"
}
```

**Client Integration:**
```javascript
async function fetchSurveyHistory(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}/surveys`);
  const data = await response.json();
  
  if (data.success) {
    // Sort by date (newest first)
    return data.data.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }
}
```

---

## 🎨 UI Components

### Survey Form Component

```jsx
import React, { useState, useEffect } from 'react';

function NetZeroSurvey({ productId }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const response = await fetch('/api/v1/products/surveys/questions');
    const data = await response.json();
    if (data.success) {
      setQuestions(data.data.questions);
    }
  }

  function handleAnswerChange(questionId, answer, score) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer, score }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const answerArray = Object.values(answers);
    
    if (answerArray.length !== 28) {
      alert('กรุณาตอบคำถามให้ครบทั้ง 28 ข้อ');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/v1/products/${productId}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.message}`);
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <SurveyResult result={result} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>แบบสำรวจ Net-Zero สำหรับ SME</h1>
      
      {questions.map((q, index) => (
        <QuestionCard
          key={q.id}
          number={index + 1}
          question={q}
          onAnswerChange={handleAnswerChange}
        />
      ))}

      <button type="submit" disabled={loading}>
        {loading ? 'กำลังประเมินผล...' : 'ส่งแบบสำรวจ'}
      </button>
      
      {loading && (
        <div className="loading-message">
          ⏳ กำลังประเมินผลด้วย AI... อาจใช้เวลา 10-60 วินาที
        </div>
      )}
    </form>
  );
}
```

### Result Display Component

```jsx
function SurveyResult({ result }) {
  const alignmentLabels = {
    beginner: { th: 'ระดับเริ่มต้น', color: '#FF6B6B' },
    emerging: { th: 'ระดับกำลังพัฒนา', color: '#FFA500' },
    consistent: { th: 'ระดับดีต่อเนื่อง', color: '#4CAF50' },
    unknown: { th: 'ไม่สามารถประเมินได้', color: '#9E9E9E' }
  };

  const alignment = alignmentLabels[result.alignmentLevel];

  return (
    <div className="survey-result">
      <h2>ผลการประเมิน Net-Zero</h2>
      
      {/* Overall Score */}
      <div className="score-card">
        <div className="score-circle" style={{ borderColor: alignment.color }}>
          <span className="score-value">{result.overallScore}</span>
          <span className="score-label">/100</span>
        </div>
        <div className="alignment-badge" style={{ backgroundColor: alignment.color }}>
          {alignment.th}
        </div>
      </div>

      {/* AI Comment */}
      <div className="ai-comment">
        <h3>💬 สรุปจากผู้เชี่ยวชาญ AI</h3>
        <p>{result.aiComment}</p>
      </div>

      {/* SBTi Compliance */}
      {result.criteriaBreakdown?.sbti_compliance_summary && (
        <div className="sbti-compliance">
          <h3>🎯 SBTi Compliance</h3>
          <ul>
            {Object.entries(result.criteriaBreakdown.sbti_compliance_summary).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Flags */}
      {result.criteriaBreakdown?.risk_flags?.length > 0 && (
        <div className="risk-flags">
          <h3>⚠️ จุดที่ต้องให้ความสนใจ</h3>
          <ul>
            {result.criteriaBreakdown.risk_flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.criteriaBreakdown?.recommendations?.length > 0 && (
        <div className="recommendations">
          <h3>✅ คำแนะนำ</h3>
          <ol>
            {result.criteriaBreakdown.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Criteria Scores */}
      <div className="criteria-scores">
        <h3>📊 คะแนนแต่ละเกณฑ์</h3>
        {Object.entries(result.criteriaBreakdown?.criteria_scores || {}).map(([code, data]) => (
          <div key={code} className="criteria-item">
            <div className="criteria-header">
              <span className="criteria-code">{code}</span>
              <span className="criteria-score">{data.score}/10</span>
            </div>
            <p className="criteria-comment">{data.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Criteria Groups (10 Groups, 28 Questions)

| Criterion Code | Thai Name | Standard | Questions |
|----------------|-----------|----------|-----------|
| **C14** | การตั้งเป้า net-zero และขอบเขต | SBTi | 3 |
| **C1-C3,C10** | การจัดทำ GHG inventory | SBTi | 3 |
| **C5** | การละเว้นไม่เกิน 5% | SBTi | 2 |
| **C4** | ความสำคัญของ Scope 3 | SBTi | 3 |
| **C6-C7** | การครอบคลุม Scope 3 | SBTi | 2 |
| **C16-C17** | กรอบเวลาของเป้าหมาย | SBTi | 3 |
| **C19-C25** | ความทะเยอทะยานสอดคล้อง 1.5°C | SBTi | 3 |
| **C12** | ใช้ offset เฉพาะส่วนที่เหลือ | SBTi | 3 |
| **ISO-equity** | ผลกระทบกว้างและความเป็นธรรม | ISO IWA 42 | 3 |
| **ISO-transparency** | ความโปร่งใสและการรายงาน | ISO IWA 42 | 3 |

---

## ⚙️ Error Handling

```javascript
try {
  const response = await fetch('/api/v1/products/surveys/questions');
  const data = await response.json();
  
  if (!data.success) {
    // Handle API-level errors
    throw new Error(data.message || 'Unknown error');
  }
  
  // Success handling
  
} catch (error) {
  if (error.name === 'TypeError') {
    // Network error
    alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
  } else if (error.message.includes('not found')) {
    // 404 error
    alert('ไม่พบข้อมูล');
  } else if (error.message.includes('Validation')) {
    // 400 validation error
    alert('ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบคำตอบของคุณ');
  } else {
    // Generic error
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  }
}
```

---

## 🔐 Production Considerations

### 1. Authentication
Add JWT token to requests:
```javascript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```

### 2. Product Validation
Currently, product validation is relaxed for testing (accepts any UUID). In production, ensure products exist in the main products table.

### 3. Rate Limiting
AI evaluation takes 10-60 seconds. Implement:
- Debouncing on submit button
- Progress indicators
- Timeout handling (set fetch timeout to 90 seconds)

### 4. Data Persistence
- Auto-save answers to localStorage during survey completion
- Allow users to resume incomplete surveys
- Store surveyResponseId for later retrieval

---

## 📝 Notes

- **AI Evaluation Time:** 10-60 seconds depending on network and OpenAI API load
- **Language:** All questions and responses are in Thai only
- **Standards:** ISO IWA 42:2022 + SBTi Corporate Net-Zero Standard v1.3
- **Alignment Levels:** `beginner` | `emerging` | `consistent` | `unknown`
- **Overall Score:** 0-100 (weighted average of 28 criteria scores)
- **Required Answers:** All 28 questions must be answered for submission

---

## 🧪 Testing

Test script available at: `netzero-chat-server/test-thai-survey.js`

Run with:
```bash
node test-thai-survey.js
```

This will test all 4 endpoints with sample beginner-level answers.

---

## 📞 Support

For issues or questions:
- Check server logs: `docker logs netzero-chat-server`
- Verify database connection
- Ensure OpenAI API key is configured
- Check that all 28 questions are loaded in database
