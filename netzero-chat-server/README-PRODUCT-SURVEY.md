# NetZero Product Survey + AI Criteria Check

## Overview

This implementation provides a complete backend system for evaluating products against net-zero and sustainability criteria using AI-powered assessment. The system accepts survey responses, evaluates them using OpenAI, and returns pass/fail/needs_review status with AI-generated comments.

## Architecture

### Database Layer (3 Tables)

#### 1. `products_survey_question`
Stores survey questions for product assessment
- `id` (VARCHAR, PK)
- `question_text` (TEXT) - The survey question in Thai or English
- `weight` (DECIMAL) - Weight for scoring calculation
- `is_active` (BOOLEAN) - Whether question is currently active
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. `products_survey_response`
Stores survey submissions with AI evaluation results
- `id` (VARCHAR, PK)
- `product_id` (VARCHAR, FK → products)
- `status` (ENUM: 'pending_ai' | 'pass' | 'fail' | 'needs_review')
- `ai_comment` (TEXT) - Short AI explanation
- `ai_raw_result` (JSON) - Full AI response for audit
- `trial_count` (INT) - Trial number per product
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE constraint on (product_id, trial_count)

#### 3. `products_survey_answer`
Stores individual answers linking responses to questions
- `id` (VARCHAR, PK)
- `survey_response_id` (VARCHAR, FK → products_survey_response)
- `question_id` (VARCHAR, FK → products_survey_question)
- `score` (DECIMAL) - Score value (1-10 scale)
- `comment` (TEXT, optional)
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE constraint on (survey_response_id, question_id)

### Models Layer

**Location:** `src/models/`
- `ProductSurveyQuestion.js` - CRUD operations for questions
- `ProductSurveyResponse.js` - CRUD operations for responses
- `ProductSurveyAnswer.js` - CRUD operations for answers (including bulk create)

### AI Utilities Layer

**Location:** `src/utils/`

#### `openAiApiUtil.js`
Low-level OpenAI API wrapper with tools support
- Handles API calls with retry logic
- Configurable timeout and backoff
- Supports multiple models (gpt-4o, gpt-4o-mini, etc.)
- **Structured JSON output using `response_format`**
- **Tools/function calling support**

**Methods:**
- `call(params)` - Main API call method
- `simpleCall(prompt, options)` - Simple prompt-based call
- `callWithSystem(systemPrompt, userPrompt, options)` - System + user messages
- `callForJson(messages, options)` - Structured JSON output with `response_format`
- `callWithTools(messages, tools, options)` - OpenAI tools/function calling

#### `simpleAiWebsearch.js`
Built on top of openAiApiUtil (as required)
- **Uses OpenAI's `web_search` tool for real-time information retrieval**
- Searches for current SDG/SBTi/ISO standards and guidelines
- Provides structured search/analysis with up-to-date information
- Accepts: searchInstruction, outputInstruction, prompt
- Returns: { result: <parsed JSON>, rawText: <original>, searchResults: <metadata> }
- **Automatically enables web search for sustainability criteria validation**

**Methods:**
- `search(input)` - Main search with web_search tool (default enabled)
- `searchWithTools(input, tools)` - Search with custom OpenAI tools
- `searchTyped(input)` - Type-safe variant
- `batchSearch(inputs)` - Parallel batch processing
- `searchWithRetry(input, maxRetries)` - Retry wrapper

**Web Search Usage:**
The service automatically uses OpenAI's web search to find:
- Latest SDG (Sustainable Development Goals) standards
- Current SBTi (Science Based Targets initiative) criteria
- ISO net-zero standards (ISO 14068, ISO 14064)
- Recent sustainability best practices for SMEs
- Current green certifications and requirements

### Service Layer

**Location:** `src/services/`

#### `AiProductSurveyService.js`
Core business logic for survey evaluation

**Main Method:** `evaluateProductSurvey(input)`

**Flow:**
1. Validate product exists
2. Validate all questions are active
3. Create survey response (status: 'pending_ai')
4. Calculate trial_count (auto-increment)
5. Save answers to database (bulk insert)
6. Load question details for AI context
7. Call simpleAiWebsearch with:
   - **searchInstruction**: SDG/SBTi/ISO criteria assessment guidance
   - **outputInstruction**: Strict JSON schema
   - **prompt**: Product + enriched survey answers
8. Update response with AI result
9. Return evaluation result

**AI Evaluation Criteria:**
- GHG measurement & reporting
- SBTi-aligned targets
- Clean/renewable energy usage
- Sustainable materials
- Product durability & repairability
- Recyclability
- Sustainable packaging
- Low-emission logistics
- Corporate sustainability policies
- Third-party certifications

**Status Logic:**
- `pass`: Score ≥ 70, minimal risks
- `fail`: Score < 50, critical gaps
- `needs_review`: Score 50-69, needs human review

**Additional Methods:**
- `getSurveyResponse(surveyResponseId)` - Get response with answers
- `getProductSurveyHistory(productId)` - Get all responses for product

### Controller Layer

**Location:** `src/controllers/`

#### `ProductSurveyController.js`
HTTP request handlers

**Methods:**
- `submitSurvey(req, res)` - POST survey for evaluation
- `getSurveyHistory(req, res)` - GET product history
- `getSurveyResponse(req, res)` - GET specific response
- `getQuestions(req, res)` - GET active questions
- `healthCheck(req, res)` - Service health check

**Error Handling:**
- 400: Validation errors
- 404: Product/Response not found
- 502: AI service errors
- 500: Generic server errors

### Routes Layer

**Location:** `src/routes/`

#### `productSurveyRoutes.js`

**Routes:**
- `POST /api/v1/products/:productId/surveys` - Submit survey (TAKES BODY OF ANSWERS)
- `GET /api/v1/products/:productId/surveys` - Get survey history
- `GET /api/v1/products/surveys/:surveyResponseId` - Get specific response
- `GET /api/v1/products/surveys/questions` - Get active questions
- `GET /api/v1/products/surveys/health` - Health check

**Validation:**
- Product ID must be string
- Answers must be non-empty array
- Each answer must have questionId (string) and score (1-10)

**Authentication:**
- Uses `optionalAuth` middleware (works with or without token)
- Can be changed to `authenticateToken` for required auth

## API Usage

### 1. Get Survey Questions

```bash
GET /api/v1/products/surveys/questions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questionCount": 10,
    "questions": [
      {
        "id": "q001",
        "questionText": "ผลิตภัณฑ์มีการวัดและรายงานการปล่อยก๊าซเรือนกระจก...",
        "weight": 1.5
      },
      ...
    ]
  }
}
```

### 2. Submit Survey for AI Evaluation

```bash
POST /api/v1/products/:productId/surveys
Content-Type: application/json

{
  "answers": [
    { "questionId": "q001", "score": 8 },
    { "questionId": "q002", "score": 6 },
    { "questionId": "q003", "score": 9 },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "surveyResponseId": "uuid-here",
    "productId": "prod-123",
    "status": "pass",
    "aiComment": "This product demonstrates strong commitment to net-zero...",
    "aiRawResult": {
      "status": "pass",
      "ai_comment": "...",
      "overall_score": 78,
      "risk_flags": [],
      "rawText": "...",
      "timestamp": "2025-12-02T..."
    }
  }
}
```

### 3. Get Survey History

```bash
GET /api/v1/products/:productId/surveys
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "prod-123",
    "surveyCount": 3,
    "surveys": [...]
  }
}
```

### 4. Get Specific Survey Response

```bash
GET /api/v1/products/surveys/:surveyResponseId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "product_id": "prod-123",
    "status": "pass",
    "ai_comment": "...",
    "ai_raw_result": {...},
    "trial_count": 1,
    "answers": [...]
  }
}
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd netzero-chat-server
npm install
```

This will install:
- `openai` (^4.20.0) - OpenAI SDK
- `uuid` (^9.0.0) - UUID generation
- All existing dependencies

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# OpenAI Configuration
DEV_OPENAI_API_KEY=your-openai-api-key-here
PROD_OPENAI_API_KEY=your-prod-openai-api-key

# Existing variables...
```

### 3. Run Database Migrations

```bash
# Connect to your MySQL database
mysql -u your_user -p your_database

# Run the migration
source sql/create_products_survey_tables.sql

# Insert sample questions
source sql/insert_sample_survey_questions.sql
```

### 4. Start the Server

```bash
npm start
# or for development
npm run dev
```

### 5. Verify Installation

```bash
# Health check
curl http://localhost:3004/api/v1/products/surveys/health

# Get questions
curl http://localhost:3004/api/v1/products/surveys/questions
```

## File Structure

```
netzero-chat-server/
├── server.js (updated with new routes)
├── package.json (updated with openai, uuid)
├── sql/
│   ├── create_products_survey_tables.sql
│   └── insert_sample_survey_questions.sql
├── src/
│   ├── models/
│   │   └── ProductSurvey.js (consolidated - all 3 models in one file)
│   ├── services/
│   │   └── AiProductSurveyService.js
│   ├── controllers/
│   │   └── ProductSurveyController.js
│   ├── routes/
│   │   └── productSurveyRoutes.js
│   └── utils/
│       ├── openAiApiUtil.js
│       └── simpleAiWebsearch.js
```

## Key Features

✅ **Complete Architecture**: Models, Services, Controllers, Routes
✅ **Database Schema**: 3 tables with proper relationships
✅ **AI Utilities**: openAiApiUtil + simpleAiWebsearch (layered as required)
✅ **OpenAI Web Search**: Uses `web_search` tool to find current SDG/SBTi/ISO standards
✅ **Real-time Validation**: AI searches for latest sustainability criteria before evaluation
✅ **Structured Outputs**: OpenAI's native `response_format` for reliable JSON
✅ **Tools Support**: Full integration with OpenAI tools/function calling
✅ **POST Route**: Takes body of answers (as required)
✅ **Trial Counting**: Auto-increments per product
✅ **Error Handling**: Comprehensive error responses
✅ **Validation**: Request validation with express-validator
✅ **Logging**: Detailed console logs for debugging
✅ **Retry Logic**: AI calls with exponential backoff
✅ **Documentation**: Full API docs and usage examples

## Testing Examples

### Test Survey Submission

```bash
curl -X POST http://localhost:3004/api/v1/products/test-prod-1/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q001", "score": 8},
      {"questionId": "q002", "score": 7},
      {"questionId": "q003", "score": 9},
      {"questionId": "q004", "score": 6},
      {"questionId": "q005", "score": 8},
      {"questionId": "q006", "score": 7},
      {"questionId": "q007", "score": 8},
      {"questionId": "q008", "score": 6},
      {"questionId": "q009", "score": 7},
      {"questionId": "q010", "score": 8}
    ]
  }'
```

## Notes

- The implementation follows your existing architecture (Express, MySQL2, no ORM)
- Uses existing middleware (optionalAuth, express-validator)
- Maintains consistent naming conventions
- Follows DI/layering patterns from your codebase
- All AI calls go through openAiApiUtil → simpleAiWebsearch → service
- The POST route accepts a body of answers (as required)
- Status determination is AI-powered based on comprehensive criteria
- Supports multiple trials per product with auto-incrementing trial_count

## Next Steps

1. ✅ Run database migrations
2. ✅ Configure OpenAI API key
3. ✅ Test endpoints with sample data
4. Consider adding:
   - Rate limiting per user
   - Caching for question lists
   - Webhooks for async processing
   - Admin endpoints for question management
   - Analytics/reporting endpoints

---

**Implementation Complete!** 🎉
