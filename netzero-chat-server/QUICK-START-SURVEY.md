# Product Survey Implementation - Quick Reference

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
mysql -u root -p netzero < sql/create_products_survey_tables.sql
mysql -u root -p netzero < sql/insert_sample_survey_questions.sql
```

### 3. Configure Environment
Add to `.env`:
```env
DEV_OPENAI_API_KEY=your-key-here
```

### 4. Start Server
```bash
npm run dev
```

---

## API Endpoints

### Get Questions
```bash
GET /api/v1/products/surveys/questions
```

### Submit Survey (MAIN ENDPOINT)
```bash
POST /api/v1/products/:productId/surveys

Body:
{
  "answers": [
    { "questionId": "q001", "score": 8 },
    { "questionId": "q002", "score": 7 }
  ]
}
```

### Get History
```bash
GET /api/v1/products/:productId/surveys
```

### Get Response
```bash
GET /api/v1/products/surveys/:surveyResponseId
```

---

## Architecture Flow

```
Request → Routes → Controller → Service → AI Utils → OpenAI
                                    ↓
                              Database Models
```

---

## Key Files

### Model (Consolidated)
- `src/models/ProductSurvey.js` - All 3 models in one file:
  - ProductSurveyQuestion
  - ProductSurveyResponse
  - ProductSurveyAnswer

### AI Utils (MUST USE LAYERING)
- `src/utils/openAiApiUtil.js` ← Base layer
- `src/utils/simpleAiWebsearch.js` ← Calls openAiApiUtil

### Service
- `src/services/AiProductSurveyService.js`

### Controller & Routes
- `src/controllers/ProductSurveyController.js`
- `src/routes/productSurveyRoutes.js`

---

## Database Schema

### products_survey_question
- id, question_text, weight, is_active

### products_survey_response
- id, product_id, status, ai_comment, ai_raw_result, trial_count

### products_survey_answer
- id, survey_response_id, question_id, score, comment

---

## Status Values

- `pending_ai` - Evaluation in progress
- `pass` - Score ≥ 70, meets criteria
- `fail` - Score < 50, critical gaps
- `needs_review` - Score 50-69, human review needed

---

## Testing

```bash
# Test with curl
curl -X POST http://localhost:3004/api/v1/products/test-prod-1/surveys \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"q001","score":8},{"questionId":"q002","score":7}]}'
```

---

## Error Codes

- `400` - Validation error
- `404` - Product/Response not found
- `502` - AI service error
- `500` - Server error

---

## Environment Variables

```env
# Required
DEV_OPENAI_API_KEY=sk-...
DEV_CHAT_DB_HOST=localhost
DEV_CHAT_DB_PORT=3306
DEV_CHAT_DB_USER=netzeroadmin
DEV_CHAT_DB_PASSWORD=your-password
DEV_CHAT_DB_NAME=netzero
```

---

## Important Notes

✅ POST route TAKES BODY OF ANSWERS (as required)
✅ simpleAiWebsearch MUST call openAiApiUtil (layered)
✅ AI evaluation uses SDG/SBTi/ISO criteria
✅ Trial count auto-increments per product
✅ Follows existing architecture patterns

---

**Ready to use!** 🚀
