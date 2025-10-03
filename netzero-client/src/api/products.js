import axiosInstance from './client.js';
import { ApiResponse, PaginatedResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

// Products API Service
class ProductsService {
  constructor() {
    this.baseUrl = '/api/v1/products';
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Get all products with optional filtering and pagination
  async getProducts(options = {}) {
    try {
      const cacheKey = `products-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached products data');
        return cached;
      }

      const params = {};
      
      // Apply filters
      if (options.category) params.category = options.category;
      if (options.type) params.type = options.type;
      if (options.isRecommend !== undefined) params.isRecommend = options.isRecommend;
      if (options.inStock) params.inStock = options.inStock;
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

      console.log(`✅ Fetched ${response.data.count} products`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw new ApiError(
        'Failed to fetch products',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const cacheKey = `product-${productId}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Using cached product data for ID: ${productId}`);
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/${productId}`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched product: ${response.data.data.title}`);
      return apiResponse;

    } catch (error) {
      if (error.response?.status === 404) {
        throw new ApiError(
          `Product with ID ${productId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }
      
      console.error('❌ Error fetching product by ID:', error);
      throw new ApiError(
        'Failed to fetch product details',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get products by type (market, willing, barter)
  async getProductsByType(type, options = {}) {
    try {
      console.log(`🔍 Fetching products for type: ${type}`);
      
      return await this.getProducts({
        ...options,
        type: type
      });

    } catch (error) {
      console.error(`❌ Error fetching products for type ${type}:`, error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category, options = {}) {
    try {
      console.log(`🔍 Fetching products for category: ${category}`);
      
      return await this.getProducts({
        ...options,
        category: category
      });

    } catch (error) {
      console.error(`❌ Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  // Get recommended products
  async getRecommendedProducts() {
    try {
      const cacheKey = 'recommended-products';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('� Using cached recommended products data');
        return cached;
      }

      const response = await axiosInstance.get(`${this.baseUrl}/recommended`);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Cache the response
      apiCache.set(cacheKey, apiResponse, this.cacheTimeout);

      console.log(`✅ Fetched ${response.data.count} recommended products`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching recommended products:', error);
      throw new ApiError(
        'Failed to fetch recommended products',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Search products
  async searchProducts(searchTerm, options = {}) {
    try {
      console.log(`🔍 Searching products for: "${searchTerm}"`);
      
      const params = {};
      if (options.category) params.category = options.category;
      if (options.type) params.type = options.type;
      if (options.inStock) params.inStock = options.inStock;

      const response = await axiosInstance.get(`${this.baseUrl}/search/${encodeURIComponent(searchTerm)}`, { params });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Found ${response.data.count} products for "${searchTerm}"`);
      return apiResponse;

    } catch (error) {
      console.error(`❌ Error searching products for "${searchTerm}":`, error);
      throw new ApiError(
        'Failed to search products',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Get current user's products
  async getMyProducts(options = {}) {
    try {
      const params = {};
      if (options.category) params.category = options.category;
      if (options.type) params.type = options.type;

      const response = await axiosInstance.get(`${this.baseUrl}/my`, { params });

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Fetched ${response.data.count} user products`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error fetching user products:', error);
      throw new ApiError(
        'Failed to fetch user products',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.message }
      );
    }
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const response = await axiosInstance.post(this.baseUrl, productData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCache();

      console.log(`✅ Created product: ${response.data.data.title}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw new ApiError(
        'Failed to create product',
        API_ERROR_TYPES.VALIDATION_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Update a product
  async updateProduct(productId, productData) {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${productId}`, productData);

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`product-${productId}`);
      this.clearCache();

      console.log(`✅ Updated product: ${response.data.data.title}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw new ApiError(
        'Failed to update product',
        API_ERROR_TYPES.VALIDATION_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Delete a product
  async deleteProduct(productId) {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${productId}`);

      const apiResponse = new ApiResponse(
        null,
        response.data.success,
        response.data.message
      );

      // Clear relevant cache entries
      this.clearCacheEntry(`product-${productId}`);
      this.clearCache();

      console.log(`✅ Deleted product ID: ${productId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw new ApiError(
        'Failed to delete product',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Upload product thumbnail
  async uploadProductThumbnail(productId, file) {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await axiosInstance.post(
        `${this.baseUrl}/${productId}/upload/thumbnail`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Uploaded thumbnail for product ID: ${productId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error uploading product thumbnail:', error);
      throw new ApiError(
        'Failed to upload product thumbnail',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Upload product cover image
  async uploadProductCover(productId, file) {
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await axiosInstance.post(
        `${this.baseUrl}/${productId}/upload/cover`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Uploaded cover for product ID: ${productId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error uploading product cover:', error);
      throw new ApiError(
        'Failed to upload product cover',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Upload product images
  async uploadProductImages(productId, files) {
    try {
      const formData = new FormData();
      
      // Append multiple files
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await axiosInstance.post(
        `${this.baseUrl}/${productId}/upload/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const apiResponse = new ApiResponse(
        response.data.data,
        response.data.success,
        response.data.message
      );

      console.log(`✅ Uploaded ${files.length} images for product ID: ${productId}`);
      return apiResponse;

    } catch (error) {
      console.error('❌ Error uploading product images:', error);
      throw new ApiError(
        'Failed to upload product images',
        API_ERROR_TYPES.SERVER_ERROR,
        error.response?.status || 500,
        { originalError: error.response?.data || error.message }
      );
    }
  }

  // Get product image URLs
  getProductThumbnailUrl(productId) {
    return `${axiosInstance.defaults.baseURL}${this.baseUrl}/${productId}/thumbnail`;
  }

  getProductCoverUrl(productId) {
    return `${axiosInstance.defaults.baseURL}${this.baseUrl}/${productId}/cover`;
  }

  getProductImageUrl(productId, imageId) {
    return `${axiosInstance.defaults.baseURL}${this.baseUrl}/${productId}/images/${imageId}`;
  }

  // Format price utility
  formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
      return '0 บาท';
    }
    return `${Number(price).toLocaleString()} บาท`;
  }

  // Clear cache
  clearCache() {
    apiCache.clear();
    console.log('🧹 Products cache cleared');
  }

  // Clear specific cache entry
  clearCacheEntry(key) {
    apiCache.delete(key);
    console.log(`🧹 Cache entry cleared: ${key}`);
  }
}

// Export singleton instance
export const productsService = new ProductsService();

// Export additional utilities
export { ProductsService };
