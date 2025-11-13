import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

/**
 * Surveys API Service
 * Handles survey operations including fetching surveys and submitting responses
 */
class SurveysService {
  constructor() {
    this.baseUrl = '/api/v1/surveys';
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Get all surveys with optional filters
   * @param {Object} options - Query options (active, upcoming, past, limit, offset)
   * @returns {Promise<ApiResponse>}
   */
  async getAll(options = {}) {
    try {
      const cacheKey = `surveys-all-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached surveys data');
        return cached;
      }

      const response = await axiosInstance.get(this.baseUrl, { params: options });

      const apiResponse = new ApiResponse(
        response.data.data || response.data,
        'success',
        response.data.message || 'Surveys retrieved successfully'
      );

      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log('✅ Fetched surveys from API');
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching surveys:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch surveys',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get survey by ID with questions
   * @param {number} surveyId - Survey ID
   * @returns {Promise<ApiResponse>}
   */
  async getById(surveyId) {
    try {
      const cacheKey = `survey-${surveyId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached survey ${surveyId} data`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/${surveyId}`);

      // Extract the actual survey data from the nested response
      // Server returns: { success, data: { survey_id, name, questions, ... }, message }
      const surveyData = response.data.data;

      const apiResponse = new ApiResponse(
        surveyData,
        'success',
        response.data.message || 'Survey retrieved successfully'
      );

      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched survey ${surveyId} from API`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error fetching survey ${surveyId}:`, error);
      
      if (error.response?.status === 404) {
        throw new ApiError(
          'Survey not found',
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }

      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch survey',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Submit survey response
   * @param {number} surveyId - Survey ID
   * @param {Object} data - Response data {respondent_id, answers: [{question_id, answer_text, answer_choice_id}]}
   * @returns {Promise<ApiResponse>}
   */
  async submitResponse(surveyId, data) {
    try {
      const response = await axiosInstance.post(
        `${this.baseUrl}/${surveyId}/submit`,
        data
      );

      console.log(`✅ Survey ${surveyId} response submitted successfully`);

      return new ApiResponse(
        response.data.data || response.data,
        'success',
        response.data.message || 'Survey response submitted successfully'
      );

    } catch (error) {
      console.error(`❌ Error submitting survey ${surveyId} response:`, error);

      if (error.response?.status === 409) {
        throw new ApiError(
          'You have already submitted a response to this survey',
          API_ERROR_TYPES.CONFLICT_ERROR,
          409
        );
      }

      if (error.response?.status === 400) {
        throw new ApiError(
          error.response?.data?.message || 'Invalid survey response data',
          API_ERROR_TYPES.VALIDATION_ERROR,
          400
        );
      }

      throw new ApiError(
        error.response?.data?.message || 'Failed to submit survey response',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get survey analytics (requires authentication)
   * @param {number} surveyId - Survey ID
   * @returns {Promise<ApiResponse>}
   */
  async getAnalytics(surveyId) {
    try {
      const response = await axiosInstance.get(
        `${this.baseUrl}/${surveyId}/analytics`
      );

      console.log(`✅ Fetched survey ${surveyId} analytics`);

      return new ApiResponse(
        response.data.data || response.data,
        'success',
        response.data.message || 'Analytics retrieved successfully'
      );

    } catch (error) {
      console.error(`❌ Error fetching survey ${surveyId} analytics:`, error);

      if (error.response?.status === 401) {
        throw new ApiError(
          'Authentication required to view analytics',
          API_ERROR_TYPES.AUTHORIZATION_ERROR,
          401
        );
      }

      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch survey analytics',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    apiCache.clear();
    console.log('🧹 Surveys cache cleared');
  }

  /**
   * Clear specific survey cache entry
   * @param {number} surveyId - Survey ID
   */
  clearCacheEntry(surveyId) {
    const cacheKey = `survey-${surveyId}`;
    apiCache.delete(cacheKey);
    console.log(`🧹 Cleared cache for survey ${surveyId}`);
  }
}

// Export singleton instance
export const surveysService = new SurveysService();

// Export as default for flexibility
export default surveysService;
