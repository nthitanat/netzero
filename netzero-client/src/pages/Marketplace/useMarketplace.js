import { useState, useEffect, useCallback } from "react";
import { productsService } from "../../api";

const useMarketplace = (type = "market") => {
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    regions: [],
    selectedCategory: "all",
    selectedRegion: "all", 
    selectedProduct: null,
    showModal: false,
    isLoading: true,
    viewMode: "grid",
    searchQuery: "",
    filterTab: "category",
    advertisements: [],
    marketType: type,
    
    // Pagination
    totalProducts: 0,
    currentPage: 1,
    hasMore: true,
    isLoadingMore: false,
    pageSize: 20,
    
    // Search
    searchInputValue: "",
    isSearchMode: false,
    isSearching: false,
    searchResults: [],
    
    // Alert
    alertVisible: false,
    alertType: "error",
    alertMessage: "",
    
    // Type-specific state
    ...(type === "barter" ? {
      productToExchange: null,
      showExchangeDialog: false
    } : {
      productToReserve: null,
      showReserveDialog: false,
      showLoginModal: false
    }),
    
    // Market-specific
    ...(type === "market" && {
      showReservationSuccessModal: false,
      reservationData: null
    })
  });

  const setMarketplace = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  // Server-side search function
  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setMarketplace({
        isSearchMode: false,
        searchResults: [],
        filteredProducts: state.products
      });
      return;
    }

    try {
      setMarketplace("isSearching", true);
      
      const searchOptions = { type };
      
      if (state.selectedCategory !== "all") {
        searchOptions.category = state.selectedCategory;
      }
      
      if (state.selectedRegion !== "all") {
        searchOptions.region = state.selectedRegion;
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

      console.log(`✅ Found ${searchResults.length} ${type} products for "${searchTerm}"`);

    } catch (error) {
      console.error("Search failed:", error);
      setState(prevState => ({
        ...prevState,
        isSearching: false,
        isSearchMode: false
      }));
    }
  }, [state.selectedCategory, state.selectedRegion, state.products, type]);

  // Fetch products with server-side filtering for category/region
  const fetchProducts = useCallback(async (filters = {}, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setMarketplace("isLoading", true);
      } else {
        setMarketplace("isLoadingMore", true);
      }

      // Build filter options for API
      const options = {
        type: type,
        limit: state.pageSize,
        offset: isLoadMore ? state.products.length : 0,
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
        hasMore: newProducts.length === state.pageSize,
        isLoading: false,
        isLoadingMore: false,
        currentPage: isLoadMore ? prevState.currentPage + 1 : 1
      }));

    } catch (error) {
      console.error(`Failed to load ${type} products:`, error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        isLoadingMore: false
      }));
    }
  }, [type, state.pageSize, state.products.length]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!state.isLoadingMore && state.hasMore) {
      const filters = {};
      if (state.selectedCategory !== "all") {
        filters.category = state.selectedCategory;
      }
      if (state.selectedRegion !== "all") {
        filters.region = state.selectedRegion;
      }
      
      fetchProducts(filters, true);
    }
  }, [state.isLoadingMore, state.hasMore, state.selectedCategory, state.selectedRegion, fetchProducts]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch initial products with pagination
        await fetchProducts();

        // Get categories and regions from a larger sample for filter options
        const metaResponse = await productsService.getProducts({ 
          type: type, 
          limit: 1000
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
        console.error("Failed to initialize data:", error);
        setState(prevState => ({
          ...prevState,
          isLoading: false
        }));
      }
    };

    initializeData();
  }, [fetchProducts, type]);

  // Server-side filtering: Refetch when category or region changes
  useEffect(() => {
    const filters = {};
    
    if (state.selectedCategory !== "all") {
      filters.category = state.selectedCategory;
    }
    
    if (state.selectedRegion !== "all") {
      filters.region = state.selectedRegion;
    }

    // Reset pagination and refetch with new filters
    fetchProducts(filters, false);
    
  }, [state.selectedCategory, state.selectedRegion, fetchProducts]);

  // Update filteredProducts when products change (for non-search mode)
  useEffect(() => {
    if (!state.isSearchMode) {
      setMarketplace("filteredProducts", state.products);
    }
  }, [state.products, state.isSearchMode]);

  // Clear search when filters change
  useEffect(() => {
    if (state.isSearchMode && state.searchQuery.trim()) {
      // Re-run the search with new filters if in search mode
      performSearch(state.searchQuery);
    }
  }, [state.selectedCategory, state.selectedRegion]);

  return {
    state,
    setState: setMarketplace,
    performSearch, 
    isSearching: state.isSearching,
    loadMore,
    hasMore: state.hasMore,
    isLoadingMore: state.isLoadingMore
  };
};

export default useMarketplace;
