import { useState, useEffect, useCallback } from "react";
import { productsService } from "../../api";

const useBarterTrade = (initialProps = {}) => {
  const [stateBarterTrade, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    regions: [],
    selectedCategory: "all",
    selectedRegion: "all", 
    selectedProduct: null,
    showModal: false,
    productToExchange: null,
    showExchangeDialog: false,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "barter",
    // New hybrid filtering states
    totalProducts: 0,
    currentPage: 1,
    hasMore: true,
    isLoadingMore: false,
    pageSize: 20,
    // Server-side search states
    searchInputValue: "", // Input field value
    isSearchMode: false, // Whether showing search results
    isSearching: false, // Search loading state
    searchResults: [], // Search results from server
    ...initialProps
  });

  // Server-side search function
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      // Empty search, return to normal products view
      setBarterTrade({
        isSearchMode: false,
        searchResults: [],
        filteredProducts: stateBarterTrade.products
      });
      return;
    }

    try {
      setBarterTrade("isSearching", true);
      
      // Build search options with current filters
      const searchOptions = {
        type: "barter"
      };
      
      if (stateBarterTrade.selectedCategory !== "all") {
        searchOptions.category = stateBarterTrade.selectedCategory;
      }
      
      if (stateBarterTrade.selectedRegion !== "all") {
        searchOptions.region = stateBarterTrade.selectedRegion;
      }

      const response = await productsService.searchProducts(searchTerm, searchOptions);
      const searchResults = response.data;

      setState(prevState => ({
        ...prevState,
        isSearchMode: true,
        searchResults: searchResults,
        filteredProducts: searchResults,
        isSearching: false
      }));

      console.log(`✅ Found ${searchResults.length} barter products for "${searchTerm}"`);

    } catch (error) {
      console.error("Search failed:", error);
      setState(prevState => ({
        ...prevState,
        isSearching: false,
        isSearchMode: false
      }));
    }
  }, [stateBarterTrade.selectedCategory, stateBarterTrade.selectedRegion, stateBarterTrade.products]);

  const setBarterTrade = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleBarterTradeField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Fetch products with server-side filtering for category/region
  const fetchProducts = useCallback(async (filters = {}, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setBarterTrade("isLoading", true);
      } else {
        setBarterTrade("isLoadingMore", true);
      }

      // Build filter options for API
      const options = {
        type: "barter",
        limit: stateBarterTrade.pageSize,
        offset: isLoadMore ? stateBarterTrade.products.length : 0,
        ...filters
      };

      // Remove 'all' values as they mean no filter
      if (options.category === "all") delete options.category;
      if (options.region === "all") delete options.region;

      const response = await productsService.getProducts(options);
      const newProducts = response.data;

      setState(prevState => ({
        ...prevState,
        products: isLoadMore 
          ? [...prevState.products, ...newProducts]
          : newProducts,
        filteredProducts: isLoadMore 
          ? [...prevState.products, ...newProducts]
          : newProducts,
        totalProducts: response.total || newProducts.length,
        hasMore: newProducts.length === stateBarterTrade.pageSize,
        isLoading: false,
        isLoadingMore: false,
        currentPage: isLoadMore ? prevState.currentPage + 1 : 1
      }));

    } catch (error) {
      console.error("Failed to load barter products:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        isLoadingMore: false
      }));
    }
  }, [stateBarterTrade.pageSize, stateBarterTrade.products.length]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!stateBarterTrade.isLoadingMore && stateBarterTrade.hasMore) {
      const filters = {};
      if (stateBarterTrade.selectedCategory !== "all") {
        filters.category = stateBarterTrade.selectedCategory;
      }
      if (stateBarterTrade.selectedRegion !== "all") {
        filters.region = stateBarterTrade.selectedRegion;
      }
      
      fetchProducts(filters, true);
    }
  }, [stateBarterTrade.isLoadingMore, stateBarterTrade.hasMore, stateBarterTrade.selectedCategory, stateBarterTrade.selectedRegion, fetchProducts]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch initial products with pagination
        await fetchProducts();

        // Get categories and regions from a larger sample for filter options
        const metaResponse = await productsService.getProducts({ 
          type: "barter", 
          limit: 1000 // Get more products to extract comprehensive filter options
        });
        const allProducts = metaResponse.data;
        
        const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
        const uniqueRegions = [...new Set(allProducts.map(product => product.address || 'Unknown'))];
        
        // Get advertisements
        const advertisementsResponse = await productsService.getRecommendedProducts();
        const advertisements = advertisementsResponse.data.slice(0, 5);
        
        setState(prevState => ({
          ...prevState,
          categories: uniqueCategories,
          regions: uniqueRegions,
          advertisements: advertisements
        }));

      } catch (error) {
        console.error("Failed to initialize barter data:", error);
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };

    initializeData();
  }, [fetchProducts]);

  // Server-side filtering: Refetch when category or region changes
  useEffect(() => {
    const filters = {};
    
    if (stateBarterTrade.selectedCategory !== "all") {
      filters.category = stateBarterTrade.selectedCategory;
    }
    
    if (stateBarterTrade.selectedRegion !== "all") {
      filters.region = stateBarterTrade.selectedRegion;
    }

    // Reset pagination and refetch with new filters
    fetchProducts(filters, false);
    
  }, [stateBarterTrade.selectedCategory, stateBarterTrade.selectedRegion, fetchProducts]);

  // Update filteredProducts when products change (for non-search mode)
  useEffect(() => {
    if (!stateBarterTrade.isSearchMode) {
      setBarterTrade("filteredProducts", stateBarterTrade.products);
    }
  }, [stateBarterTrade.products, stateBarterTrade.isSearchMode]);

  // Clear search when filters change
  useEffect(() => {
    if (stateBarterTrade.isSearchMode && stateBarterTrade.searchQuery.trim()) {
      // Re-run the search with new filters if in search mode
      performSearch(stateBarterTrade.searchQuery);
    }
  }, [stateBarterTrade.selectedCategory, stateBarterTrade.selectedRegion]);

  return {
    stateBarterTrade,
    setBarterTrade,
    toggleBarterTradeField,
    // Hybrid filtering functions
    loadMore,
    // Server-side search function
    performSearch,
    // Loading states
    isLoading: stateBarterTrade.isLoading,
    isLoadingMore: stateBarterTrade.isLoadingMore,
    hasMore: stateBarterTrade.hasMore,
    isSearching: stateBarterTrade.isSearching
  };
};

export default useBarterTrade;
