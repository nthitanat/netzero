import axios from 'axios';
import { ApiResponse, ApiError, API_ERROR_TYPES, API_STATUS, apiCache } from './types.js';
import { storageService } from '../utils/storage';

// Create a separate axios instance for chat server (where survey APIs are hosted)
const chatServerInstance = axios.create({
  baseURL: process.env.REACT_APP_CHAT_API_BASE_URL || 'http://localhost:3004/api/v1',
  timeout: 90000, // 90 seconds for AI evaluation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
chatServerInstance.interceptors.request.use(
  (config) => {
    const token = storageService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 Chat API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Chat API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
chatServerInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Chat API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Chat API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error);
    return Promise.reject(error);
  }
);

/**
 * Product Survey Service
 * Handles Thai Net-Zero Survey API (28 questions)
 * Base URL: http://localhost:3004/api/v1
 */
class ProductSurveyService {
  constructor() {
    this.baseUrl = '/products';
    this.cacheTimeout = 300000; // 5 minutes for questions cache
  }

  /**
   * Get all active survey questions (28 Thai questions)
   * @returns {Promise<ApiResponse>} 28 questions grouped by 10 criteria
   */
  async getQuestions() {
    try {
      // Check cache first
      const cacheKey = 'survey_questions';
      const cached = apiCache.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached questions');
        return new ApiResponse(cached, API_STATUS.SUCCESS, 'Questions retrieved from cache');
      }

      console.log('🌐 Fetching questions from server...');
      const response = await chatServerInstance.get(`${this.baseUrl}/surveys/questions`);
      
      console.log('📊 Server response:', response.data);
      
      if (response.data.success) {
        // Cache the questions
        apiCache.set(cacheKey, response.data.data, this.cacheTimeout);
        const apiResponse = new ApiResponse(
          response.data.data,  // data first
          API_STATUS.SUCCESS,   // then status
          'Survey questions retrieved successfully'  // then message
        );
        console.log('✅ ApiResponse created:', apiResponse);
        return apiResponse;
      }

      throw new ApiError(
        API_ERROR_TYPES.SERVER_ERROR,
        response.data.message || 'Failed to retrieve questions'
      );
    } catch (error) {
      console.error('❌ Error fetching survey questions:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      throw new ApiError(
        API_ERROR_TYPES.NETWORK_ERROR,
        error.response?.data?.message || error.message || 'Failed to fetch survey questions'
      );
    }
  }

  /**
   * Submit survey answers for AI evaluation
   * @param {string} productId - Product UUID
   * @param {Array} answers - Array of answers [{questionId, answer, score}]
   * @returns {Promise<ApiResponse>} AI evaluation results
   */
  async submitSurvey(productId, answers) {
    try {
      if (!productId) {
        throw new ApiError(API_ERROR_TYPES.VALIDATION_ERROR, 'Product ID is required');
      }

      if (!Array.isArray(answers)) {
        throw new ApiError(
          API_ERROR_TYPES.VALIDATION_ERROR,
          'Answers must be an array'
        );
      }

      // Basic validation - check answer structure
      const invalidAnswers = answers.filter(
        a => !a.questionId || !a.answer || typeof a.score !== 'number'
      );

      if (invalidAnswers.length > 0) {
        throw new ApiError(
          API_ERROR_TYPES.VALIDATION_ERROR,
          'Each answer must have questionId, answer, and score'
        );
      }

      const response = await chatServerInstance.post(
        `${this.baseUrl}/${productId}/surveys`,
        { answers },
        {
          timeout: 90000 // 90 seconds for AI evaluation
        }
      );

      if (response.data.success) {
        return new ApiResponse(
          response.data.data,
          API_STATUS.SUCCESS,
          'Survey evaluated successfully'
        );
      }

      throw new ApiError(
        API_ERROR_TYPES.SERVER_ERROR,
        response.data.message || 'Failed to submit survey'
      );
    } catch (error) {
      console.error('❌ Error submitting survey:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new ApiError(
          API_ERROR_TYPES.VALIDATION_ERROR,
          error.response.data.message || 'Invalid survey data'
        );
      }

      if (error.response?.status === 404) {
        throw new ApiError(
          API_ERROR_TYPES.NOT_FOUND,
          'Product not found'
        );
      }

      if (error.response?.status === 502) {
        throw new ApiError(
          API_ERROR_TYPES.SERVER_ERROR,
          'AI service temporarily unavailable. Please try again.'
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new ApiError(
          API_ERROR_TYPES.TIMEOUT,
          'Survey evaluation timed out. Please try again.'
        );
      }

      throw new ApiError(
        API_ERROR_TYPES.NETWORK_ERROR,
        error.response?.data?.message || error.message || 'Failed to submit survey'
      );
    }
  }

  /**
   * Get survey details by response ID
   * @param {string} surveyResponseId - Survey response UUID
   * @returns {Promise<ApiResponse>} Survey response with all answers
   */
  async getSurveyDetails(surveyResponseId) {
    try {
      if (!surveyResponseId) {
        throw new ApiError(API_ERROR_TYPES.VALIDATION_ERROR, 'Survey response ID is required');
      }

      const response = await chatServerInstance.get(`${this.baseUrl}/surveys/${surveyResponseId}`);

      if (response.data.success) {
        // Parse JSON fields if they're strings
        const data = response.data.data;
        if (typeof data.criteria_breakdown === 'string') {
          data.criteria_breakdown = JSON.parse(data.criteria_breakdown);
        }
        if (typeof data.ai_raw_result === 'string') {
          data.ai_raw_result = JSON.parse(data.ai_raw_result);
        }

        return new ApiResponse(
          data,
          API_STATUS.SUCCESS,
          'Survey details retrieved successfully'
        );
      }

      throw new ApiError(
        API_ERROR_TYPES.SERVER_ERROR,
        response.data.message || 'Failed to retrieve survey details'
      );
    } catch (error) {
      console.error('❌ Error fetching survey details:', error);

      if (error.response?.status === 404) {
        throw new ApiError(
          API_ERROR_TYPES.NOT_FOUND,
          'Survey response not found'
        );
      }

      throw new ApiError(
        API_ERROR_TYPES.NETWORK_ERROR,
        error.response?.data?.message || error.message || 'Failed to fetch survey details'
      );
    }
  }

  /**
   * Get survey history for a product
   * @param {string} productId - Product UUID
   * @returns {Promise<ApiResponse>} Array of survey responses
   */
  async getSurveyHistory(productId) {
    try {
      if (!productId) {
        throw new ApiError(API_ERROR_TYPES.VALIDATION_ERROR, 'Product ID is required');
      }

      const response = await chatServerInstance.get(`${this.baseUrl}/${productId}/surveys`);

      if (response.data.success) {
        // Sort by date (newest first)
        const data = (response.data.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        return new ApiResponse(
          data,
          API_STATUS.SUCCESS,
          'Survey history retrieved successfully'
        );
      }

      throw new ApiError(
        API_ERROR_TYPES.SERVER_ERROR,
        response.data.message || 'Failed to retrieve survey history'
      );
    } catch (error) {
      console.error('❌ Error fetching survey history:', error);

      throw new ApiError(
        API_ERROR_TYPES.NETWORK_ERROR,
        error.response?.data?.message || error.message || 'Failed to fetch survey history'
      );
    }
  }

  /**
   * Group questions by criterion for better UX
   * @param {Array} questions - Array of questions
   * @returns {Array} Grouped questions
   */
  groupQuestionsByCriterion(questions) {
    if (!Array.isArray(questions)) return [];

    const grouped = questions.reduce((acc, q) => {
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

    return Object.values(grouped).sort((a, b) => {
      // Sort by display order of first question
      const orderA = a.questions[0]?.displayOrder || 999;
      const orderB = b.questions[0]?.displayOrder || 999;
      return orderA - orderB;
    });
  }
}

// Export singleton instance
export const productSurveyService = new ProductSurveyService();

// Export as default
export default productSurveyService;
