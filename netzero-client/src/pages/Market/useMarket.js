import { useState, useEffect, useCallback } from "react";
import { productsService } from "../../api";

const useMarket = (initialProps = {}) => {
  const [stateMarket, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    regions: [],
    selectedCategory: "all",
    selectedRegion: "all", 
    selectedProduct: null,
    showModal: false,
    showReserveDialog: false,
    showLoginModal: false,
    productToReserve: null,
    isLoading: true,
    viewMode: "grid", // grid or list
    searchQuery: "",
    filterTab: "category", // category or region
    advertisements: [],
    marketType: "market",
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
      setMarket({
        isSearchMode: false,
        searchResults: [],
        filteredProducts: stateMarket.products
      });
      return;
    }

    try {
      setMarket("isSearching", true);
      
      // Build search options with current filters
      const searchOptions = {
        type: "market"
      };
      
      if (stateMarket.selectedCategory !== "all") {
        searchOptions.category = stateMarket.selectedCategory;
      }
      
      if (stateMarket.selectedRegion !== "all") {
        searchOptions.region = stateMarket.selectedRegion;
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

      console.log(`✅ Found ${searchResults.length} products for "${searchTerm}"`);

    } catch (error) {
      console.error("Search failed:", error);
      setState(prevState => ({
        ...prevState,
        isSearching: false,
        isSearchMode: false
      }));
    }
  }, [stateMarket.selectedCategory, stateMarket.selectedRegion, stateMarket.products]);

  const setMarket = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  const toggleMarketField = (field) => {
    setState((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Fetch products with server-side filtering for category/region
  const fetchProducts = useCallback(async (filters = {}, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setMarket("isLoading", true);
      } else {
        setMarket("isLoadingMore", true);
      }

      // Build filter options for API
      const options = {
        type: "market",
        limit: stateMarket.pageSize,
        offset: isLoadMore ? stateMarket.products.length : 0,
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
        hasMore: newProducts.length === stateMarket.pageSize,
        isLoading: false,
        isLoadingMore: false,
        currentPage: isLoadMore ? prevState.currentPage + 1 : 1
      }));

    } catch (error) {
      console.error("Failed to load products:", error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        isLoadingMore: false
      }));
    }
  }, [stateMarket.pageSize, stateMarket.products.length]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!stateMarket.isLoadingMore && stateMarket.hasMore) {
      const filters = {};
      if (stateMarket.selectedCategory !== "all") {
        filters.category = stateMarket.selectedCategory;
      }
      if (stateMarket.selectedRegion !== "all") {
        filters.region = stateMarket.selectedRegion;
      }
      
      fetchProducts(filters, true);
    }
  }, [stateMarket.isLoadingMore, stateMarket.hasMore, stateMarket.selectedCategory, stateMarket.selectedRegion, fetchProducts]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch initial products with pagination
        await fetchProducts();

        // Get categories and regions from a larger sample for filter options
        const metaResponse = await productsService.getProducts({ 
          type: "market", 
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
        console.error("Failed to initialize data:", error);
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
    
    if (stateMarket.selectedCategory !== "all") {
      filters.category = stateMarket.selectedCategory;
    }
    
    if (stateMarket.selectedRegion !== "all") {
      filters.region = stateMarket.selectedRegion;
    }

    // Reset pagination and refetch with new filters
    fetchProducts(filters, false);
    
  }, [stateMarket.selectedCategory, stateMarket.selectedRegion, fetchProducts]);

  // Update filteredProducts when products change (for non-search mode)
  useEffect(() => {
    if (!stateMarket.isSearchMode) {
      setMarket("filteredProducts", stateMarket.products);
    }
  }, [stateMarket.products, stateMarket.isSearchMode]);

  // Clear search when filters change
  useEffect(() => {
    if (stateMarket.isSearchMode && stateMarket.searchQuery.trim()) {
      // Re-run the search with new filters if in search mode
      performSearch(stateMarket.searchQuery);
    }
  }, [stateMarket.selectedCategory, stateMarket.selectedRegion]);

  return {
    stateMarket,
    setMarket,
    toggleMarketField,
    // Hybrid filtering functions
    loadMore,
    // Server-side search function
    performSearch,
    // Loading states
    isLoading: stateMarket.isLoading,
    isLoadingMore: stateMarket.isLoadingMore,
    hasMore: stateMarket.hasMore,
    isSearching: stateMarket.isSearching
  };
};

export default useMarket;
