import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

// User Events API Service for event ownership and management
class UserEventsService {
  constructor() {
    this.baseUrl = '/api/v1/user-events';
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Get all events owned by a specific user
  async getUserEvents(userId) {
    try {
      const cacheKey = `user-events-${userId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached user events for user ID: ${userId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/user/${userId}/events`);

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `User events retrieved successfully for user ${userId}`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched events for user: ${userId}`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error fetching events for user ${userId}:`, error);
      throw new ApiError(
        error.response?.data?.message || `Failed to fetch events for user ${userId}`,
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get events for the currently authenticated user
  async getMyEvents() {
    try {
      const cacheKey = 'my-events';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached my events data');
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/my-events`);

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Your events retrieved successfully'
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log('✅ Fetched my events');
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching my events:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch your events',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Join an event (create user-event relationship)
  async joinEvent(userId, eventId) {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/join`, {
        userId,
        eventId
      });

      // Clear relevant cache entries
      this.clearUserEventsCache(userId);
      apiCache.delete('my-events');

      console.log(`✅ User ${userId} joined event ${eventId}`);
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Successfully joined event'
      );

    } catch (error) {
      console.error(`❌ Error joining event ${eventId} for user ${userId}:`, error);
      
      if (error.response?.status === 409) {
        throw new ApiError(
          error.response?.data?.message || 'Already joined this event',
          API_ERROR_TYPES.CONFLICT_ERROR,
          409
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to join event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Leave an event (remove user-event relationship)
  async leaveEvent(userId, eventId) {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/user/${userId}/event/${eventId}`);

      // Clear relevant cache entries
      this.clearUserEventsCache(userId);
      apiCache.delete('my-events');

      console.log(`✅ User ${userId} left event ${eventId}`);
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Successfully left event'
      );

    } catch (error) {
      console.error(`❌ Error leaving event ${eventId} for user ${userId}:`, error);
      
      if (error.response?.status === 404) {
        throw new ApiError(
          error.response?.data?.message || 'User-event relationship not found',
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to leave event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get all users for a specific event
  async getEventUsers(eventId) {
    try {
      const cacheKey = `event-users-${eventId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached event users for event ID: ${eventId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/event/${eventId}/users`);

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `Event users retrieved successfully for event ${eventId}`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched users for event: ${eventId}`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error fetching users for event ${eventId}:`, error);
      throw new ApiError(
        error.response?.data?.message || `Failed to fetch users for event ${eventId}`,
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Check if user owns/is associated with an event
  async checkEventOwnership(userId, eventId) {
    try {
      const cacheKey = `ownership-${userId}-${eventId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached ownership data for user ${userId}, event ${eventId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/user/${userId}/event/${eventId}/ownership`);

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Ownership check completed'
      );

      // Cache the response (shorter cache for ownership checks)
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout / 2);

      console.log(`✅ Checked ownership for user ${userId}, event ${eventId}`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error checking ownership for user ${userId}, event ${eventId}:`, error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to check event ownership',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Clear cache for specific user events
  clearUserEventsCache(userId) {
    const keysToDelete = [];
    
    // Find all cache keys related to this user
    for (const key of apiCache.keys()) {
      if (key.includes(`user-events-${userId}`) || 
          key.includes(`ownership-${userId}-`) ||
          key.includes(`event-users-`)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete the keys
    keysToDelete.forEach(key => {
      apiCache.delete(key);
    });
    
    console.log(`🧹 Cleared user events cache for user: ${userId}`);
  }

  // Clear all user events cache
  clearCache() {
    const keysToDelete = [];
    
    for (const key of apiCache.keys()) {
      if (key.includes('user-events') || 
          key.includes('my-events') || 
          key.includes('ownership') ||
          key.includes('event-users')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      apiCache.delete(key);
    });
    
    console.log('🧹 User events cache cleared');
  }
}

// Export singleton instance
export const userEventsService = new UserEventsService();

// Export as default for flexibility
export default userEventsService;