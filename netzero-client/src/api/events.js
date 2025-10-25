import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

// Events API Service
class EventsService {
  constructor() {
    this.baseUrl = '/api/v1/events';
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Get all events with optional pagination
  async getEvents(options = {}) {
    try {
      const cacheKey = `events-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached events data');
        return cached;
      }

      // Build query parameters
      const params = {};
      if (options.page) params.page = options.page;
      if (options.limit) params.limit = options.limit;
      if (options.sortBy) params.sortBy = options.sortBy;
      if (options.sortOrder) params.sortOrder = options.sortOrder;

      const response = await axiosInstance.get(this.baseUrl, { params });

      // Wrap response data in our ApiResponse format
      const apiResponse = new ApiResponse(
        response.data.data || response.data,
        'success',
        response.data.message || 'Events retrieved successfully'
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched events from API`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching events:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch events',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get event by ID
  async getEventById(eventId) {
    try {
      const cacheKey = `event-${eventId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached event data for ID: ${eventId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/${eventId}`);

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `Event ${eventId} retrieved successfully`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched event: ${eventId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching event by ID:', error);
      
      if (error.response?.status === 404) {
        throw new ApiError(
          `Event with ID ${eventId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch event details',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get recommended/featured events
  async getRecommendedEvents(limit = 5) {
    try {
      const cacheKey = `recommended-events-${limit}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached recommended events data');
        return cached;
      }

      const params = {};
      if (limit) params.limit = limit;

      const response = await axiosInstance.get(`${this.baseUrl}/recommended`, { params });

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `Retrieved recommended events`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched recommended events`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching recommended events:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch recommended events',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get events by category (server-side filtering)
  async getEventsByCategory(category, options = {}) {
    try {
      console.log(`🔍 Fetching events for category: ${category}`);
      
      const cacheKey = `events-category-${category}-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('� Using cached category events data');
        return cached;
      }

      // Build query parameters
      const params = {};
      if (options.page) params.page = options.page;
      if (options.limit) params.limit = options.limit;
      if (options.sortBy) params.sortBy = options.sortBy;
      if (options.sortOrder) params.sortOrder = options.sortOrder;

      const response = await axiosInstance.get(`${this.baseUrl}/category/${encodeURIComponent(category)}`, { params });

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `Retrieved events for category: ${category}`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched events for category: ${category}`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error fetching events for category ${category}:`, error);
      throw new ApiError(
        error.response?.data?.message || `Failed to fetch events for category: ${category}`,
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Search events by name (server-side search)
  async searchEvents(searchTerm, options = {}) {
    try {
      console.log(`� Searching events for: "${searchTerm}"`);
      
      const cacheKey = `events-search-${searchTerm}-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached search results');
        return cached;
      }

      // Build query parameters
      const params = {};
      if (options.page) params.page = options.page;
      if (options.limit) params.limit = options.limit;
      if (options.sortBy) params.sortBy = options.sortBy;
      if (options.sortOrder) params.sortOrder = options.sortOrder;

      const response = await axiosInstance.get(`${this.baseUrl}/search/${encodeURIComponent(searchTerm)}`, { params });

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        response.data.message || `Search results for: ${searchTerm}`
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Search completed for: "${searchTerm}"`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error searching events for "${searchTerm}":`, error);
      throw new ApiError(
        error.response?.data?.message || `Failed to search events for: ${searchTerm}`,
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get event poster image URL
  getEventPosterUrl(eventId) {
    return `${axiosInstance.defaults.baseURL}${this.baseUrl}/${eventId}/poster`;
  }

  // Get event thumbnail image URL
  getEventThumbnailUrl(eventId) {
    return `${axiosInstance.defaults.baseURL}${this.baseUrl}/${eventId}/thumbnail`;
  }

  // Get event poster image blob (for downloading)
  async getEventPoster(eventId) {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${eventId}/poster`, {
        responseType: 'blob'
      });

      return {
        data: response.data,
        contentType: response.headers['content-type'],
        url: URL.createObjectURL(response.data)
      };

    } catch (error) {
      console.error(`❌ Error fetching poster for event ${eventId}:`, error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch event poster',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get event thumbnail image blob (for downloading)
  async getEventThumbnail(eventId) {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${eventId}/thumbnail`, {
        responseType: 'blob'
      });

      return {
        data: response.data,
        contentType: response.headers['content-type'],
        url: URL.createObjectURL(response.data)
      };

    } catch (error) {
      console.error(`❌ Error fetching thumbnail for event ${eventId}:`, error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch event thumbnail',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get event categories (if available from API)
  async getEventCategories() {
    try {
      const cacheKey = 'event-categories';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached categories data');
        return cached;
      }

      // Try to get categories from a dedicated endpoint if available
      // Otherwise, fetch all events and extract categories
      let response;
      try {
        response = await axiosInstance.get(`${this.baseUrl}/categories`);
      } catch (error) {
        // Fallback: get all events and extract categories
        console.log('📋 Categories endpoint not available, extracting from events...');
        const eventsResponse = await this.getEvents({ limit: 1000 });
        const events = eventsResponse.data;
        
        const categories = [...new Set(events
          .map(event => event.category)
          .filter(Boolean)
        )].sort();

        const apiResponse = ApiResponse.success(
          categories,
          'Event categories extracted from events'
        );

        // Cache the response (longer cache for categories)
        apiCache.set(cacheKey, apiResponse, this.cacheTimeout * 2);

        return apiResponse;
      }

      const apiResponse = ApiResponse.success(
        response.data.data || response.data,
        'Event categories retrieved successfully'
      );

      // Cache the response (longer cache for categories)
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout * 2);

      console.log(`✅ Fetched event categories`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching event categories:', error);
      throw new ApiError(
        error.response?.data?.message || 'Failed to fetch event categories',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Create a new event
  async createEvent(eventData) {
    try {
      console.log('📝 Creating new event:', eventData);

      const response = await axiosInstance.post(this.baseUrl, eventData);

      // Clear cache since we have new data
      this.clearCache();

      console.log('✅ Event created successfully');
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Event created successfully'
      );

    } catch (error) {
      console.error('❌ Error creating event:', error);
      
      if (error.response?.status === 400) {
        throw new ApiError(
          error.response?.data?.message || 'Invalid event data provided',
          API_ERROR_TYPES.VALIDATION_ERROR,
          400,
          { validationErrors: error.response?.data?.errors }
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to create event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Update an existing event
  async updateEvent(eventId, eventData) {
    try {
      console.log(`📝 Updating event ${eventId}:`, eventData);

      const response = await axiosInstance.put(`${this.baseUrl}/${eventId}`, eventData);

      // Clear cache since we have updated data
      this.clearCache();
      this.clearCacheEntry(`event-${eventId}`);

      console.log(`✅ Event ${eventId} updated successfully`);
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Event updated successfully'
      );

    } catch (error) {
      console.error(`❌ Error updating event ${eventId}:`, error);
      
      if (error.response?.status === 400) {
        throw new ApiError(
          error.response?.data?.message || 'Invalid event data provided',
          API_ERROR_TYPES.VALIDATION_ERROR,
          400,
          { validationErrors: error.response?.data?.errors }
        );
      }
      
      if (error.response?.status === 403) {
        throw new ApiError(
          error.response?.data?.message || 'You do not have permission to update this event',
          API_ERROR_TYPES.FORBIDDEN_ERROR,
          403
        );
      }
      
      if (error.response?.status === 404) {
        throw new ApiError(
          error.response?.data?.message || `Event with ID ${eventId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to update event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Delete an event (hard delete)
  async deleteEvent(eventId) {
    try {
      console.log(`🗑️ Deleting event ${eventId}`);

      const response = await axiosInstance.delete(`${this.baseUrl}/${eventId}`);

      // Clear cache since we have deleted data
      this.clearCache();
      this.clearCacheEntry(`event-${eventId}`);

      console.log(`✅ Event ${eventId} deleted successfully`);
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Event deleted successfully'
      );

    } catch (error) {
      console.error(`❌ Error deleting event ${eventId}:`, error);
      
      if (error.response?.status === 403) {
        throw new ApiError(
          error.response?.data?.message || 'You do not have permission to delete this event',
          API_ERROR_TYPES.FORBIDDEN_ERROR,
          403
        );
      }
      
      if (error.response?.status === 404) {
        throw new ApiError(
          error.response?.data?.message || `Event with ID ${eventId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to delete event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Cancel an event (soft delete)
  async cancelEvent(eventId) {
    try {
      console.log(`❌ Cancelling event ${eventId}`);

      const response = await axiosInstance.put(`${this.baseUrl}/${eventId}/cancel`);

      // Clear cache since we have updated data
      this.clearCache();
      this.clearCacheEntry(`event-${eventId}`);

      console.log(`✅ Event ${eventId} cancelled successfully`);
      return ApiResponse.success(
        response.data.data || response.data,
        response.data.message || 'Event cancelled successfully'
      );

    } catch (error) {
      console.error(`❌ Error cancelling event ${eventId}:`, error);
      
      if (error.response?.status === 403) {
        throw new ApiError(
          error.response?.data?.message || 'You do not have permission to cancel this event',
          API_ERROR_TYPES.FORBIDDEN_ERROR,
          403
        );
      }
      
      if (error.response?.status === 404) {
        throw new ApiError(
          error.response?.data?.message || `Event with ID ${eventId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      throw new ApiError(
        error.response?.data?.message || 'Failed to cancel event',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Note: Registration endpoints will be implemented later
  // Keep these methods for compatibility but they will throw errors for now
  async registerForEvent(eventId, registrationData) {
    throw new ApiError(
      'Event registration is not yet implemented',
      API_ERROR_TYPES.NOT_IMPLEMENTED,
      501
    );
  }

  async getEventRegistrationStatus(eventId) {
    throw new ApiError(
      'Event registration status is not yet implemented',
      API_ERROR_TYPES.NOT_IMPLEMENTED,
      501
    );
  }

  // Clear cache
  clearCache() {
    apiCache.clear();
    console.log('🧹 Events cache cleared');
  }

  // Clear specific cache entry
  clearCacheEntry(key) {
    apiCache.delete(key);
    console.log(`🧹 Cache entry cleared: ${key}`);
  }
}

// Export singleton instance
export const eventsService = new EventsService();

// Export additional utilities
export { EventsService };
