import { axiosInstance } from './client';
import { ApiResponse, ApiError, API_ERROR_TYPES, API_STATUS } from './types';

// Determine chat server URL based on environment
const getChatServerURL = () => {
  // Check if we have an environment variable set
  if (process.env.REACT_APP_CHAT_SERVER_URL) {
    return process.env.REACT_APP_CHAT_SERVER_URL;
  }
  
  // Auto-detect based on NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3004/api/v1/chat';
  }
  
  // Production URL - adjust this to your production chat server URL
  return 'https://engagement.chula.ac.th/chat/api/v1/chat';
};

class ChatService {
  constructor() {
    this.baseUrl = '/api/v1/chatapps';
    this.chatServerUrl = getChatServerURL();
  }

  // ==========================================
  // Chat Applications Management (Main Server)
  // ==========================================

  // Get all chat applications
  async getAllChatApps(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.owner_id) queryParams.append('owner_id', filters.owner_id);
      if (filters.product_id) queryParams.append('product_id', filters.product_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = queryParams.toString() ? `${this.baseUrl}?${queryParams.toString()}` : this.baseUrl;
      
      const response = await axiosInstance.get(url);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Retrieved ${response.data.data.length} chat applications`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error getting chat applications:', error);
      throw new ApiError(
        'Failed to retrieve chat applications',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Get current user's chat applications
  async getMyChatApps() {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/my`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Retrieved ${response.data.data.length} user chat applications`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error getting user chat applications:', error);
      throw new ApiError(
        'Failed to retrieve your chat applications',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Get chat application by ID
  async getChatAppById(id) {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Retrieved chat application: ${id}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error getting chat application by ID:', error);
      throw new ApiError(
        'Failed to retrieve chat application',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Create new chat application
  async createChatApp(chatAppData) {
    try {
      const response = await axiosInstance.post(this.baseUrl, chatAppData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Created chat application: ${response.data.data.chatApp.id}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error creating chat application:', error);
      throw new ApiError(
        'Failed to create chat application',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Update chat application
  async updateChatApp(id, updateData) {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${id}`, updateData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Updated chat application: ${id}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error updating chat application:', error);
      throw new ApiError(
        'Failed to update chat application',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Delete chat application
  async deleteChatApp(id) {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${id}`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Deleted chat application: ${id}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error deleting chat application:', error);
      throw new ApiError(
        'Failed to delete chat application',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Get chat statistics
  async getChatStatistics() {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/statistics`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Retrieved chat statistics`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error getting chat statistics:', error);
      throw new ApiError(
        'Failed to retrieve chat statistics',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // ==========================================
  // Chat Communication (Chat Server)
  // ==========================================

  // Get chat welcome message
  async getChatWelcome(chatId) {
    try {
      const response = await axiosInstance.get(`${this.chatServerUrl}/${chatId}`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Got welcome message for chat: ${chatId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error getting chat welcome:', error);
      throw new ApiError(
        'Failed to get chat welcome message',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Send message to chat
  async sendMessage(chatId, message) {
    try {
      const response = await axiosInstance.post(`${this.chatServerUrl}/${chatId}/message`, {
        message
      });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success ? API_STATUS.SUCCESS : API_STATUS.ERROR,
        response.data.message
      );

      console.log(`✅ Sent message to chat: ${chatId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new ApiError(
        'Failed to send message',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }



  // Check chat server health
  async checkChatHealth() {
    try {
      const response = await axiosInstance.get(`${this.chatServerUrl}/health`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Chat server health check passed`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Chat server health check failed:', error);
      throw new ApiError(
        'Chat server is not available',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }
}

export const chatService = new ChatService();
