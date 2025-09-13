import { productsData, advertisementsData } from '../data/productsData.js';
import { ApiResponse, PaginatedResponse, ApiError, API_ERROR_TYPES, apiCache } from './types.js';

// Products API Service
class ProductsService {
  constructor() {
    this.baseUrl = '/api/products';
    this.cacheTimeout = 300000; // 5 minutes
  }

  // Simulate API delay for realistic behavior
  async simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

      await this.simulateDelay();

      // Extract options with defaults
      const {
        page = 1,
        limit = 10,
        category = null,
        region = null,
        search = null,
        sortBy = 'title',
        sortOrder = 'asc',
        inStock = null,
        marketType = null,
      } = options;

      let filteredProducts = [...productsData];

      // Apply category filter
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Apply region filter
      if (region && region !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.region?.toLowerCase() === region.toLowerCase()
        );
      }

      // Apply market type filter
      if (marketType && marketType !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.marketType?.toLowerCase() === marketType.toLowerCase()
        );
      }

      // Apply stock filter
      if (inStock !== null) {
        filteredProducts = filteredProducts.filter(product => 
          product.inStock === inStock
        );
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.origin.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'category':
            comparison = a.category.localeCompare(b.category);
            break;
          case 'region':
            comparison = a.region.localeCompare(b.region);
            break;
          case 'origin':
            comparison = a.origin.localeCompare(b.origin);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      // Apply pagination
      const totalItems = filteredProducts.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      const pagination = {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      const response = new PaginatedResponse(
        paginatedProducts,
        pagination,
        'success',
        `Retrieved ${paginatedProducts.length} products`
      );

      // Cache the response
      apiCache.set(cacheKey, response, this.cacheTimeout);

      console.log(`✅ Fetched ${paginatedProducts.length} products (page ${page}/${totalPages})`);
      return response;

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw new ApiError(
        'Failed to fetch products',
        API_ERROR_TYPES.SERVER_ERROR,
        500,
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

      await this.simulateDelay(300);

      // Convert productId to number for comparison since URL params are strings
      const numericProductId = parseInt(productId, 10);
      const product = productsData.find(product => product.id === numericProductId);

      if (!product) {
        throw new ApiError(
          `Product with ID ${productId} not found`,
          API_ERROR_TYPES.NOT_FOUND_ERROR,
          404
        );
      }

      const response = ApiResponse.success(
        product,
        `Product ${productId} retrieved successfully`
      );

      // Cache the response
      apiCache.set(cacheKey, response, this.cacheTimeout);

      console.log(`✅ Fetched product: ${product.title}`);
      return response;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('❌ Error fetching product by ID:', error);
      throw new ApiError(
        'Failed to fetch product details',
        API_ERROR_TYPES.SERVER_ERROR,
        500,
        { originalError: error.message }
      );
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

  // Get products by region
  async getProductsByRegion(region, options = {}) {
    try {
      console.log(`🔍 Fetching products for region: ${region}`);
      
      return await this.getProducts({
        ...options,
        region: region
      });

    } catch (error) {
      console.error(`❌ Error fetching products for region ${region}:`, error);
      throw error;
    }
  }

  // Get products by market type
  async getProductsByMarketType(marketType, options = {}) {
    try {
      console.log(`🔍 Fetching products for market type: ${marketType}`);
      
      return await this.getProducts({
        ...options,
        marketType: marketType
      });

    } catch (error) {
      console.error(`❌ Error fetching products for market type ${marketType}:`, error);
      throw error;
    }
  }

  // Get available products (in stock)
  async getAvailableProducts(options = {}) {
    try {
      console.log('🔍 Fetching available products');
      
      return await this.getProducts({
        ...options,
        inStock: true
      });

    } catch (error) {
      console.error('❌ Error fetching available products:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm, options = {}) {
    try {
      console.log(`🔍 Searching products for: "${searchTerm}"`);
      
      return await this.getProducts({
        ...options,
        search: searchTerm
      });

    } catch (error) {
      console.error(`❌ Error searching products for "${searchTerm}":`, error);
      throw error;
    }
  }

  // Get product categories
  async getProductCategories() {
    try {
      const cacheKey = 'product-categories';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached categories data');
        return cached;
      }

      await this.simulateDelay(100);

      const categories = [...new Set(productsData
        .map(product => product.category)
        .filter(Boolean)
      )].sort();

      const response = ApiResponse.success(
        categories,
        'Product categories retrieved successfully'
      );

      // Cache the response (longer cache for categories)
      apiCache.set(cacheKey, response, this.cacheTimeout * 2);

      console.log(`✅ Fetched ${categories.length} product categories`);
      return response;

    } catch (error) {
      console.error('❌ Error fetching product categories:', error);
      throw new ApiError(
        'Failed to fetch product categories',
        API_ERROR_TYPES.SERVER_ERROR,
        500,
        { originalError: error.message }
      );
    }
  }

  // Get product regions
  async getProductRegions() {
    try {
      const cacheKey = 'product-regions';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached regions data');
        return cached;
      }

      await this.simulateDelay(100);

      const regions = [...new Set(productsData
        .map(product => product.region)
        .filter(Boolean)
      )].sort();

      const response = ApiResponse.success(
        regions,
        'Product regions retrieved successfully'
      );

      // Cache the response (longer cache for regions)
      apiCache.set(cacheKey, response, this.cacheTimeout * 2);

      console.log(`✅ Fetched ${regions.length} product regions`);
      return response;

    } catch (error) {
      console.error('❌ Error fetching product regions:', error);
      throw new ApiError(
        'Failed to fetch product regions',
        API_ERROR_TYPES.SERVER_ERROR,
        500,
        { originalError: error.message }
      );
    }
  }

  // Get advertisements
  async getAdvertisements(options = {}) {
    try {
      const cacheKey = `advertisements-${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        console.log('📦 Using cached advertisements data');
        return cached;
      }

      await this.simulateDelay(200);

      const { limit = 10 } = options;
      const limitedAds = advertisementsData.slice(0, limit);

      const response = ApiResponse.success(
        limitedAds,
        `Retrieved ${limitedAds.length} advertisements`
      );

      // Cache the response
      apiCache.set(cacheKey, response, this.cacheTimeout);

      console.log(`✅ Fetched ${limitedAds.length} advertisements`);
      return response;

    } catch (error) {
      console.error('❌ Error fetching advertisements:', error);
      throw new ApiError(
        'Failed to fetch advertisements',
        API_ERROR_TYPES.SERVER_ERROR,
        500,
        { originalError: error.message }
      );
    }
  }

  // Format price utility
  formatPrice(price) {
    return `${price.toLocaleString()} บาท`;
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
