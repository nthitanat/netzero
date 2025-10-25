import { axiosInstance } from './client.js';

const API_BASE = '/api/v1/event-products';

/**
 * Event Products Service
 * Handles API calls for event-product relationships
 */
class EventProductsService {
  /**
   * Get all event products with optional filters
   * @param {Object} filters - Optional filters (event_id, product_id, status)
   * @returns {Promise} API response with event products
   */
  async getAllEventProducts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.event_id) params.append('event_id', filters.event_id);
    if (filters.product_id) params.append('product_id', filters.product_id);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    
    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Get event product by ID
   * @param {number} id - Event product ID
   * @returns {Promise} API response with event product
   */
  async getEventProductById(id) {
    const response = await axiosInstance.get(`${API_BASE}/${id}`);
    return response.data;
  }

  /**
   * Get all events for a specific product
   * @param {number} productId - Product ID
   * @returns {Promise} API response with events
   */
  async getEventsByProductId(productId) {
    const response = await axiosInstance.get(`${API_BASE}/product/${productId}/events`);
    return response.data;
  }

  /**
   * Get all products for a specific event
   * @param {number} eventId - Event ID
   * @returns {Promise} API response with products
   */
  async getProductsByEventId(eventId) {
    const response = await axiosInstance.get(`${API_BASE}/event/${eventId}/products`);
    return response.data;
  }

  /**
   * Create a new event product
   * @param {Object} eventProductData - Event product data
   * @returns {Promise} API response with created event product
   */
  async createEventProduct(eventProductData) {
    const response = await axiosInstance.post(API_BASE, eventProductData);
    return response.data;
  }

  /**
   * Update an event product
   * @param {number} id - Event product ID
   * @param {Object} eventProductData - Updated event product data
   * @returns {Promise} API response with updated event product
   */
  async updateEventProduct(id, eventProductData) {
    const response = await axiosInstance.put(`${API_BASE}/${id}`, eventProductData);
    return response.data;
  }

  /**
   * Update event product with stock calculation (PATCH)
   * Updates both event_products and products tables with proper stock calculations
   * @param {number} id - Event product ID
   * @param {Object} updateData - { event_price?, stock_quantity? }
   * @returns {Promise} API response with updated event product and product stock info
   */
  async patchEventProduct(id, updateData) {
    const response = await axiosInstance.patch(`${API_BASE}/${id}`, updateData);
    return response.data;
  }

  /**
   * Delete an event product
   * @param {number} id - Event product ID
   * @returns {Promise} API response
   */
  async deleteEventProduct(id) {
    const response = await axiosInstance.delete(`${API_BASE}/${id}`);
    return response.data;
  }

  /**
   * Add multiple products to an event (batch operation)
   * @param {Array} eventProducts - Array of event product data
   * @returns {Promise} API response with created event products
   */
  async addProductsToEvent(eventProducts) {
    const promises = eventProducts.map(ep => this.createEventProduct(ep));
    return Promise.all(promises);
  }

  /**
   * Add a product to multiple events (batch operation)
   * @param {number} productId - Product ID
   * @param {Array} events - Array of event assignments {event_id, event_price, stock_quantity}
   * @returns {Promise} API response with created event products
   */
  async addProductToEvents(productId, events) {
    const promises = events.map(event => 
      this.createEventProduct({
        product_id: productId,
        event_id: event.event_id,
        event_price: event.event_price,
        stock_quantity: event.stock_quantity
      })
    );
    return Promise.all(promises);
  }
}

// Create singleton instance
const eventProductsService = new EventProductsService();

// Export both the class and the instance
export { EventProductsService };
export { eventProductsService };
export default eventProductsService;
