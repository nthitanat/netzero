import axiosInstance from './client.js';
import { ApiResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

// Product Reservations API Service
class ReservationsService {
  constructor() {
    this.baseUrl = '/api/v1/reservations';
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Get all reservations with optional filtering
  async getReservations(options = {}) {
    try {
      const cacheKey = `reservations-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached reservations data');
        return cached;
      }

      const params = {};
      
      // Apply filters
      if (options.user_id) params.user_id = options.user_id;
      if (options.product_id) params.product_id = options.product_id;
      if (options.product_owner_id) params.product_owner_id = options.product_owner_id;
      if (options.status) params.status = options.status;
      if (options.limit) params.limit = options.limit;
      if (options.offset) params.offset = options.offset;

      const response = await axiosInstance.get(this.baseUrl, { params });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched ${response.data.count} reservations`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      throw new ApiError(
        'Failed to fetch reservations',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get reservation by ID
  async getReservationById(reservationId) {
    try {
      const cacheKey = `reservation-${reservationId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached reservation data for ID: ${reservationId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/${reservationId}`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched reservation ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      if (error.response?.status === 404) {
        throw new ApiError(
          `Reservation with ID ${reservationId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      console.error('❌ Error fetching reservation by ID:', error);
      throw new ApiError(
        'Failed to fetch reservation details',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get current user's reservations (as customer)
  async getMyReservations(status = null) {
    try {
      const params = {};
      if (status) params.status = status;

      const response = await axiosInstance.get(`${this.baseUrl}/my`, { params });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Fetched ${response.data.count} user reservations`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching user reservations:', error);
      throw new ApiError(
        'Failed to fetch user reservations',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get reservations for current user's products (as seller)
  async getMyProductReservations(status = null) {
    try {
      const params = {};
      if (status) params.status = status;

      const response = await axiosInstance.get(`${this.baseUrl}/my-products`, { params });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Fetched ${response.data.count} product reservations`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching product reservations:', error);
      throw new ApiError(
        'Failed to fetch product reservations',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get reservation statistics for current user (as seller)
  async getReservationStats() {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log('✅ Fetched reservation statistics');
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching reservation statistics:', error);
      throw new ApiError(
        'Failed to fetch reservation statistics',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Create a new reservation
  async createReservation(reservationData) {
    try {
      const response = await axiosInstance.post(this.baseUrl, reservationData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCache();

      console.log('✅ Created reservation');
      return apiResponse;

    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      throw new ApiError(
        'Failed to create reservation',
        API_ERROR_TYPES.VALIDATION_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Update a reservation
  async updateReservation(reservationId, reservationData) {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${reservationId}`, reservationData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`reservation-${reservationId}`);
      this.clearCache();

      console.log(`✅ Updated reservation ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error updating reservation:', error);
      throw new ApiError(
        'Failed to update reservation',
        API_ERROR_TYPES.VALIDATION_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Delete a reservation
  async deleteReservation(reservationId) {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${reservationId}`);

      const apiResponse = new ApiResponse(
        null,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`reservation-${reservationId}`);
      this.clearCache();

      console.log(`✅ Deleted reservation ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error deleting reservation:', error);
      throw new ApiError(
        'Failed to delete reservation',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Confirm a reservation (for product owners)
  async confirmReservation(reservationId) {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${reservationId}/confirm`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`reservation-${reservationId}`);
      this.clearCache();

      console.log(`✅ Confirmed reservation ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error confirming reservation:', error);
      throw new ApiError(
        'Failed to confirm reservation',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Cancel a reservation
  async cancelReservation(reservationId) {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${reservationId}/cancel`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`reservation-${reservationId}`);
      this.clearCache();

      console.log(`✅ Cancelled reservation ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      throw new ApiError(
        'Failed to cancel reservation',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Update reservation status (for product owners)
  async updateReservationStatus(reservationId, status) {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${reservationId}/status`, {
        status: status
      });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`reservation-${reservationId}`);
      this.clearCache();

      console.log(`✅ Updated reservation status to ${status} for ID: ${reservationId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error updating reservation status:', error);
      throw new ApiError(
        'Failed to update reservation status',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Get reservations for a specific product (for product owners)
  async getProductReservations(productId) {
    try {
      const response = await axiosInstance.get(`/api/v1/products/${productId}/reservations`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Fetched ${response.data.count} reservations for product ID: ${productId}`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error fetching reservations for product ${productId}:`, error);
      throw new ApiError(
        'Failed to fetch product reservations',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Utility methods for reservation status
  getStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status) {
    switch (status) {
      case 'pending':
        return 'รอการยืนยัน';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'cancelled':
        return 'ยกเลิกแล้ว';
      default:
        return status;
    }
  }

  // Check if reservation can be modified
  canModifyReservation(reservation, currentUserId) {
    // Can modify if user owns the reservation or owns the product
    return (
      reservation.user_id === currentUserId || 
      reservation.product?.owner_id === currentUserId
    ) && reservation.status === 'pending';
  }

  // Check if reservation can be confirmed
  canConfirmReservation(reservation, currentUserId) {
    return (
      reservation.product?.owner_id === currentUserId && 
      reservation.status === 'pending'
    );
  }

  // Check if reservation can be cancelled
  canCancelReservation(reservation, currentUserId) {
    return (
      (reservation.user_id === currentUserId || reservation.product?.owner_id === currentUserId) &&
      reservation.status === 'pending'
    );
  }

  // Clear cache
  clearCache() {
    apiCache.clear();
    console.log('🧹 Reservations cache cleared');
  }

  // Clear specific cache entry
  clearCacheEntry(key) {
    apiCache.delete(key);
    console.log(`🧹 Cache entry cleared: ${key}`);
  }
}

// Export singleton instance
export const reservationsService = new ReservationsService();

// Export additional utilities
export { ReservationsService };